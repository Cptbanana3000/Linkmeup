import { json } from '@sveltejs/kit';
import { findUsersByUsernamePattern } from '$lib/db/models/user.js';

export async function GET({ url, locals }) {
    try {
        // Check authentication
        if (!locals.user?.userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const query = url.searchParams.get('q');
        const currentUserId = locals.user.userId;

        // Validate query
        if (!query || typeof query !== 'string') {
            return json({ users: [] });
        }

        // Get users using the model function
        const users = await findUsersByUsernamePattern(query, currentUserId);

        // Log successful search
        console.log(`Search completed for "${query}". Found ${users.length} users.`);

        return json({
            users: users.map(user => ({
                id: user._id.toString(),
                username: user.username,
                avatar: user.avatar || null
            }))
        });

    } catch (error) {
        console.error('Search error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return json({ 
            error: 'Failed to search users',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { 
            status: 500 
        });
    }
} 