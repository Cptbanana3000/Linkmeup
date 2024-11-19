import { closeDbConnection } from '$lib/db/index.js';

export async function handleServerError({ error }) {
    console.error('Server error:', error);
    return {
        message: 'An unexpected error occurred'
    };
}

export async function handleServerClose() {
    await closeDbConnection();
} 