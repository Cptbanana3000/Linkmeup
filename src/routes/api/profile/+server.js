import { json } from '@sveltejs/kit';
import { findUserById } from '$lib/db/models/user.js';
import mongoose from 'mongoose';

export async function GET({ request, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return json({ error: 'Invalid user ID' }, { status: 400 });
        }

        // Find user in database
        const user = await findUserById(userId);
        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        // Return user profile data
        return json({
            username: user.username,
            avatar: user.avatar || null,
            bio: user.bio || '',
            followers: user.followers?.length || 0,
            following: user.following?.length || 0
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        return json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
} 