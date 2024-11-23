import { json } from '@sveltejs/kit';
import { Post } from '$lib/db/models/post.js';
import { Comment } from '$lib/db/models/comment.js';

export async function GET({ request, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '9');
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            Post.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            Post.countDocuments({ userId })
        ]);

        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const commentCount = await Comment.countDocuments({ postId: post._id });
            return {
                ...post,
                comments: commentCount,
                likes: Array.isArray(post.likes) ? post.likes : []
            };
        }));

        const hasMore = skip + posts.length < total;

        return json({
            posts: postsWithCounts,
            hasMore,
            total,
            page,
            pages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching user posts:', error);
        return json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
} 