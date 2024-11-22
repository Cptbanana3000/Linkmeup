import { json } from '@sveltejs/kit';
import { Comment } from '$lib/db/models/comment.js';
import { Post } from '$lib/db/models/post.js';
import mongoose from 'mongoose';

export async function DELETE({ params, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const comment = await Comment.findOne({
                _id: params.commentId,
                userId // Ensure user owns the comment
            }).session(session);

            if (!comment) {
                await session.abortTransaction();
                return json({ error: 'Comment not found' }, { status: 404 });
            }

            await Comment.deleteOne({ _id: params.commentId }).session(session);
            await Post.updateOne(
                { _id: params.postId },
                { $inc: { comments: -1 } }
            ).session(session);

            await session.commitTransaction();
            return json({ success: true });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error deleting comment:', error);
        return json({ error: 'Failed to delete comment' }, { status: 500 });
    }
} 