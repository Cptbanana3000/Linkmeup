import { closeDbConnection } from '$lib/db/index.js';
import jwt from 'jsonwebtoken';

export async function handleServerError({ error }) {
    console.error('Server error:', error);
    return {
        message: 'An unexpected error occurred'
    };
}

export async function handleServerClose() {
    await closeDbConnection();
}

export async function handle({ event, resolve }) {
    // First check for Authorization header
    const authHeader = event.request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split('Bearer ')[1];
    } else {
        // If no Authorization header, check for token in cookies
        token = event.cookies.get('token');
    }

    console.log('Token in hooks:', token ? 'present' : 'missing'); // Debug log

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified for user:', decoded.userId);
            event.locals.user = decoded;
        } catch (error) {
            console.error('JWT verification failed:', error);
            event.locals.user = null;
            
            // Only return 401 for API routes
            if (event.url.pathname.startsWith('/api/')) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }
    } else {
        event.locals.user = null;
    }

    // For protected routes, redirect to login if not authenticated
    const protectedRoutes = ['/profile', '/create', '/messages'];
    if (protectedRoutes.some(route => event.url.pathname.startsWith(route)) && !event.locals.user) {
        return new Response(null, {
            status: 302,
            headers: { Location: '/login' }
        });
    }

    const response = await resolve(event);
    return response;
} 