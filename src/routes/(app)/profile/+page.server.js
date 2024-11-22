import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/utils/auth.js';

export async function load({ request, locals }) {
    console.log('Profile page load, locals:', locals); // Debug log

    // Check if user is authenticated
    if (!locals.user) {
        console.log('No user in locals, redirecting to login'); // Debug log
        throw redirect(302, '/login');
    }

    return {
        user: locals.user
    };
} 