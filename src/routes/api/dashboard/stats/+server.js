import { json } from '@sveltejs/kit';
import { verifyToken } from '$lib/utils/auth.js';

export async function GET({ request }) {
    try {
        // Get token from header
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return json({ message: 'No authorization token provided' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return json({ message: 'Invalid token' }, { status: 401 });
        }

        // For now, return dummy data
        // In a real application, you would fetch this from your database
        const stats = {
            totalLinks: 12,
            totalClicks: 156,
            activeLinks: 8
        };

        const recentActivity = [
            {
                type: 'New Link Created',
                description: 'Created new link: example.com/short',
                timestamp: new Date().toISOString()
            },
            {
                type: 'Link Clicked',
                description: 'Link example.com/short was clicked 5 times',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            }
        ];

        return json({
            stats,
            recentActivity
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return json({
            message: 'An error occurred while fetching dashboard stats'
        }, { status: 500 });
    }
} 