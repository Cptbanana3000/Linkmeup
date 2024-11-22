import { describe, it, expect, beforeEach } from 'vitest';
import { Post } from '$lib/db/models/post.js';
import { Like } from '$lib/db/models/like.js';
import { testUser, testToken } from './setup.js';

describe('Like Endpoints', () => {
    let testPost;

    beforeEach(async () => {
        await Like.deleteMany({});
        await Post.deleteMany({});
        
        testPost = await Post.create({
            userId: testUser._id,
            caption: 'Test post',
            mediaUrl: 'test.jpg',
            type: 'image'
        });
    });

    describe('POST /api/posts/:id/like', () => {
        it('should toggle like status', async () => {
            // Like the post
            let response = await fetch(`/api/posts/${testPost._id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${testToken}`
                }
            });

            expect(response.status).toBe(200);
            let data = await response.json();
            expect(data.liked).toBe(true);

            // Unlike the post
            response = await fetch(`/api/posts/${testPost._id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${testToken}`
                }
            });

            expect(response.status).toBe(200);
            data = await response.json();
            expect(data.liked).toBe(false);
        });
    });
}); 