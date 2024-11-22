import { json } from '@sveltejs/kit';
import { Post } from '$lib/db/models/post.js';

export async function PATCH({ request, params, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const post = await Post.findOne({ 
            _id: params.id,
            userId // Ensure user owns the post
        });

        if (!post) {
            return json({ error: 'Post not found' }, { status: 404 });
        }

        const data = await request.json();
        
        // Only allow updating certain fields
        const allowedUpdates = ['caption'];
        const updates = {};
        
        for (const field of allowedUpdates) {
            if (data[field] !== undefined) {
                updates[field] = data[field];
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(
            params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).lean();

        return json({
            success: true,
            post: {
                id: updatedPost._id.toString(),
                mediaUrl: updatedPost.mediaUrl,
                mediaUrls: updatedPost.mediaUrls || [],
                type: updatedPost.type,
                caption: updatedPost.caption,
                likes: updatedPost.likes,
                comments: updatedPost.comments,
                createdAt: updatedPost.createdAt
            }
        });

    } catch (error) {
        console.error('Error updating post:', error);
        return json({ error: 'Failed to update post' }, { status: 500 });
    }
} 