import { describe, it, expect, beforeEach } from 'vitest';
import { Post } from '$lib/db/models/post.js';
import { Comment } from '$lib/db/models/comment.js';
import { testUser, testToken } from './setup.js';

describe('Comment Endpoints', () => {
    let testPost;

    beforeEach(async () => {
        await Comment.deleteMany({});
        await Post.deleteMany({});
        
        testPost = await Post.create({
            userId: testUser._id,
            caption: 'Test post',
            mediaUrl: 'test.jpg',
            type: 'image'
        });
    });

    describe('POST /api/posts/:id/comments', () => {
        it('should create a new comment', async () => {
            const response = await fetch(`/api/posts/${testPost._id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${testToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: 'Test comment'
                })
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.comment.content).toBe('Test comment');
        });
    });
}); 