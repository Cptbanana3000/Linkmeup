import { json } from '@sveltejs/kit';
import { Comment } from '$lib/db/models/comment.js';
import { Post } from '$lib/db/models/post.js';
import mongoose from 'mongoose';

// Get all comments for a post
export async function GET({ params, locals }) {
    try {
        const comments = await Comment.find({ postId: params.postId })
            .sort({ createdAt: -1 })
            .populate('userId', 'username')
            .lean();

        return json({
            comments: comments.map(comment => ({
                id: comment._id,
                content: comment.content,
                createdAt: comment.createdAt,
                user: {
                    id: comment.userId._id,
                    username: comment.userId.username
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// Create a new comment
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

        // Create the comment
        const comment = await Comment.create({
            userId,
            postId: params.postId,
            content: content.trim()
        });

        // Update post comment count
        await Post.findByIdAndUpdate(params.postId, {
            $inc: { comments: 1 }
        });

        // Fetch the populated comment
        const populatedComment = await Comment.findById(comment._id)
            .populate('userId', 'username')
            .lean();

        return json({
            comment: {
                id: populatedComment._id,
                content: populatedComment.content,
                createdAt: populatedComment.createdAt,
                user: {
                    id: populatedComment.userId._id,
                    username: populatedComment.userId.username
                }
            }
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        return json({ error: 'Failed to create comment' }, { status: 500 });
    }
} 