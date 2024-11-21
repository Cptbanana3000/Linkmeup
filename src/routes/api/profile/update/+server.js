import { json } from '@sveltejs/kit';
import { uploadAvatar, deleteAvatar } from '$lib/utils/cloudinary.js';
import { updateUser, findUserById, findUserByUsername } from '$lib/db/models/user.js';
import { validateProfile } from '$lib/utils/validation.js';
import mongoose from 'mongoose';

export async function POST({ request, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const updates = {
            username: formData.get('username'),
            bio: formData.get('bio') || ''
        };

        // Handle avatar upload
        const avatarFile = formData.get('avatar');
        if (avatarFile && avatarFile.size > 0) {
            try {
                const avatarData = await uploadAvatar(avatarFile);
                updates.avatar = avatarData.url; // Just store the URL for now
            } catch (error) {
                return json({ error: 'Failed to upload avatar' }, { status: 400 });
            }
        }

        const updatedUser = await updateUser(userId, updates);
        
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