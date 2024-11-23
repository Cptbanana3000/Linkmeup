import { json } from '@sveltejs/kit';
import { findUserByUsername } from '$lib/db/models/user.js';
import { Post } from '$lib/db/models/post.js';

export async function GET({ params, locals }) {
    try {
        const username = params.username;
        const currentUserId = locals.user?.userId;

        if (!currentUserId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findUserByUsername(username);
        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        // Get post count
        const postCount = await Post.countDocuments({ userId: user._id });

        return json({
            id: user._id,
            username: user.username,
            bio: user.bio || '',
            avatar: user.avatar || null,
            followers: user.followers?.length || 0,
            following: user.following?.length || 0,
            postCount,
            isCurrentUser: user._id.toString() === currentUserId
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
} 