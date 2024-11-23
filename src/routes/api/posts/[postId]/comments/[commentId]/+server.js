import { json } from '@sveltejs/kit';
import { Comment } from '$lib/db/models/comment.js';
import { Post } from '$lib/db/models/post.js';

export async function DELETE({ params, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find and delete the comment
        const comment = await Comment.findOneAndDelete({
            _id: params.commentId,
            userId: userId,
            postId: params.postId
        });

        if (!comment) {
            return json({ error: 'Comment not found' }, { status: 404 });
        }

        // Decrement the post's comment count
        await Post.findByIdAndUpdate(params.postId, {
            $inc: { comments: -1 }
        });

        return json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return json({ error: 'Failed to delete comment' }, { status: 500 });
    }
} 