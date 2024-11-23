import { json } from '@sveltejs/kit';
import { Post } from '$lib/db/models/post.js';
import { Comment } from '$lib/db/models/comment.js';
import { findUserByUsername } from '$lib/db/models/user.js';
import mongoose from 'mongoose';

export async function GET({ params, url, locals }) {
    try {
        console.log('Fetching posts for username:', params.username);
        
        if (!locals.user?.userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findUserByUsername(params.username);
        console.log('Found user:', user?._id);

        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '9');
        const skip = (page - 1) * limit;

        const posts = await Post.find({ 
            userId: new mongoose.Types.ObjectId(user._id) 
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

        console.log('Found posts:', posts.length);

        const total = await Post.countDocuments({ 
            userId: new mongoose.Types.ObjectId(user._id) 
        });

        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const commentCount = await Comment.countDocuments({ 
                postId: post._id 
            });
            
            return {
                ...post,
                id: post._id.toString(),
                comments: commentCount,
                likes: Array.isArray(post.likes) ? post.likes.length : 0
            };
        }));

        console.log('Processed posts:', postsWithCounts.length);

        return json({
            posts: postsWithCounts,
            hasMore: skip + posts.length < total,
            total,
            page,
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching user posts:', error);
        return json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
} 