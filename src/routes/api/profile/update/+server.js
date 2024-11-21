import { json } from '@sveltejs/kit';
import { uploadAvatar } from '$lib/utils/cloudinary.js';
import { updateUser, findUserById, findUserByUsername } from '$lib/db/models/user.js';
import { validateProfile } from '$lib/utils/validation.js';
import mongoose from 'mongoose';

export async function POST({ request, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const formData = await request.formData();
        const updates = {
            username: formData.get('username'),
            bio: formData.get('bio') || ''
        };

        // Validate the updates
        const { isValid, errors } = validateProfile(updates);
        if (!isValid) {
            return json({ errors }, { status: 400 });
        }

        // Check if username is taken (excluding current user)
        const existingUser = await findUserByUsername(updates.username);
        if (existingUser && existingUser._id.toString() !== userId) {
            return json({ 
                errors: { username: profileValidation.username.messages.taken }
            }, { status: 400 });
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