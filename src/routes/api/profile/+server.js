import { json } from '@sveltejs/kit';
import { findUserById } from '$lib/db/models/user.js';

export async function GET({ locals }) {
    try {
        if (!locals.user?.userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findUserById(locals.user.userId);
        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({
            username: user.username,
            email: user.email,
            bio: user.bio || '',
            avatar: user.avatar || null,
            followers: user.followers?.length || 0,
            following: user.following?.length || 0
        });
    } catch (error) {
        console.error('Profile error:', error);
        return json({ error: 'Server error' }, { status: 500 });
    }
} 