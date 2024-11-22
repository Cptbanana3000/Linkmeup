import { json } from '@sveltejs/kit';
import { Comment } from '$lib/db/models/comment.js';
import { Post } from '$lib/db/models/post.js';
import mongoose from 'mongoose';

// Get comments for a post
export async function GET({ params, request }) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            Comment.find({ postId: params.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'username avatar')
                .lean()
                .exec(),
            Comment.countDocuments({ postId: params.id })
        ]);

        const transformedComments = comments.map(comment => ({
            id: comment._id.toString(),
            content: comment.content,
            createdAt: comment.createdAt,
            user: {
                id: comment.userId._id.toString(),
                username: comment.userId.username,
                avatar: comment.userId.avatar
            }
        }));

        return json({
            comments: transformedComments,
            hasMore: skip + comments.length < total,
            total,
            page,
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        return json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// Add a comment
export async function POST({ request, params, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await request.json();
        if (!content?.trim()) {
            return json({ error: 'Comment content is required' }, { status: 400 });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create comment and update post comment count
            const [comment] = await Comment.create([{
                userId,
                postId: params.id,
                content: content.trim()
            }], { session });

            await Post.updateOne(
                { _id: params.id },
                { $inc: { comments: 1 } }
            ).session(session);

            await session.commitTransaction();

            // Fetch the populated comment
            const populatedComment = await Comment.findById(comment._id)
                .populate('userId', 'username avatar')
                .lean();

            return json({
                success: true,
                comment: {
                    id: populatedComment._id.toString(),
                    content: populatedComment.content,
                    createdAt: populatedComment.createdAt,
                    user: {
                        id: populatedComment.userId._id.toString(),
                        username: populatedComment.userId.username,
                        avatar: populatedComment.userId.avatar
                    }
                }
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error creating comment:', error);
        return json({ error: 'Failed to create comment' }, { status: 500 });
    }
} 