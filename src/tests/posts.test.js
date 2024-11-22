import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Post } from '$lib/db/models/post.js';
import { testUser, testToken } from './setup.js';

describe('Post Endpoints', () => {
    beforeEach(async () => {
        await Post.deleteMany({});
    });

    describe('POST /api/posts/create', () => {
        it('should create a new post', async () => {
            const formData = new FormData();
            formData.append('caption', 'Test post');
            // Mock file data
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            formData.append('media', mockFile);

            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${testToken}`
                },
                body: formData
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.post.caption).toBe('Test post');
        });
    });

    describe('GET /api/posts/user', () => {
        it('should fetch user posts with pagination', async () => {
            // Create test posts
            await Post.create([
                { userId: testUser._id, caption: 'Post 1', mediaUrl: 'test1.jpg', type: 'image' },
                { userId: testUser._id, caption: 'Post 2', mediaUrl: 'test2.jpg', type: 'image' }
            ]);

            const response = await fetch('/api/posts/user?page=1&limit=9', {
                headers: {
                    'Authorization': `Bearer ${testToken}`
                }
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.posts).toHaveLength(2);
            expect(data.total).toBe(2);
        });
    });
}); 