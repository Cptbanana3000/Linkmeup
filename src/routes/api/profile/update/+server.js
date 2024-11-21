import { json } from '@sveltejs/kit';
import { uploadAvatar } from '$lib/utils/cloudinary.js';
import { updateUser, findUserById } from '$lib/db/models/user.js';
import mongoose from 'mongoose';

export async function POST({ request, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const formData = await request.formData();
        const updates = {};

        // Handle text fields
        if (formData.has('username')) {
            updates.username = formData.get('username');
        }
        if (formData.has('bio')) {
            updates.bio = formData.get('bio');
        }

        // Handle avatar upload
        const avatarFile = formData.get('avatar');
        if (avatarFile && avatarFile.size > 0) {
            const avatarUrl = await uploadAvatar(avatarFile);
            updates.avatar = avatarUrl;
        }

        const updatedUser = await updateUser(userId, updates);
        if (!updatedUser) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({
            success: true,
            username: updatedUser.username,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return json({ error: 'Failed to update profile' }, { status: 500 });
    }
} 