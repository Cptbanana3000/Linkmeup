import { json } from '@sveltejs/kit';
import { Post } from '$lib/db/models/post.js';
import mongoose from 'mongoose';

export async function POST({ params, locals }) {
    try {
        const { postId } = params;
        const userId = locals.user?.userId;

        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return json({ error: 'Post not found' }, { status: 404 });
        }

        if (!Array.isArray(post.likes)) {
            post.likes = [];
        }

        const hasLiked = post.likes.includes(userId);
        
        if (hasLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        return json({
            likes: post.likes,
            hasLiked: !hasLiked,
            likesCount: post.likes.length
        });
    } catch (error) {
        console.error('Like error:', error);
        return json({ error: 'Failed to update like' }, { status: 500 });
    }
} 