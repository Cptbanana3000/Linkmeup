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
    const authHeader = event.request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            event.locals.user = decoded;
        } catch (error) {
            console.error('JWT verification failed:', error);
        }
    }

    return resolve(event);
} 