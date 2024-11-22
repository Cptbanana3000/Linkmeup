import { json } from '@sveltejs/kit';
import { Post } from '$lib/db/models/post.js';
import mongoose from 'mongoose';

// Create a Like model for tracking user likes
const likeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

likeSchema.index({ userId: 1, postId: 1 }, { unique: true });
const Like = mongoose.models.Like || mongoose.model('Like', likeSchema);

export async function POST({ params, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check if already liked
            const existingLike = await Like.findOne({ 
                userId, 
                postId: params.id 
            }).session(session);

            if (existingLike) {
                // Unlike
                await Like.deleteOne({ _id: existingLike._id }).session(session);
                await Post.updateOne(
                    { _id: params.id },
                    { $inc: { likes: -1 } }
                ).session(session);
            } else {
                // Like
                await Like.create([{
                    userId,
                    postId: params.id
                }], { session });
                await Post.updateOne(
                    { _id: params.id },
                    { $inc: { likes: 1 } }
                ).session(session);
            }

            await session.commitTransaction();
            return json({ 
                success: true,
                liked: !existingLike
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error toggling like:', error);
        return json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}

// Endpoint to check if user has liked a post
export async function GET({ params, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const like = await Like.findOne({ userId, postId: params.id });
        return json({ liked: !!like });

    } catch (error) {
        console.error('Error checking like status:', error);
        return json({ error: 'Failed to check like status' }, { status: 500 });
    }
} 