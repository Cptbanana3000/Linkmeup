import { json } from '@sveltejs/kit';
import { Post } from '$lib/db/models/post.js';
import { Comment } from '$lib/db/models/comment.js';
import { Like } from '$lib/db/models/like.js';
import { deleteMedia, getPublicIdFromUrl } from '$lib/utils/cloudinary.js';
import mongoose from 'mongoose';

export async function DELETE({ params, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const post = await Post.findOne({ 
                _id: params.id,
                userId
            }).session(session);

            if (!post) {
                await session.abortTransaction();
                return json({ error: 'Post not found' }, { status: 404 });
            }

            // Delete all associated data
            await Promise.all([
                Comment.deleteMany({ postId: params.id }).session(session),
                Like.deleteMany({ postId: params.id }).session(session),
                post.deleteOne()
            ]);

            await session.commitTransaction();

            // Delete media from Cloudinary after successful DB cleanup
            const mediaUrls = [post.mediaUrl, ...(post.mediaUrls || [])];
            const uniqueUrls = [...new Set(mediaUrls)].filter(Boolean);

            await Promise.all(
                uniqueUrls.map(async (url) => {
                    const publicId = getPublicIdFromUrl(url);
                    if (publicId) {
                        try {
                            await deleteMedia(publicId);
                        } catch (error) {
                            console.error('Error deleting media:', error);
                            // Don't throw error as DB transaction is already complete
                        }
                    }
                })
            );

            return json({ success: true });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error deleting post:', error);
        return json({ error: 'Failed to delete post' }, { status: 500 });
    }
} oka