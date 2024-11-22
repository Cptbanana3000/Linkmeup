import { json } from '@sveltejs/kit';
import { Post } from '$lib/db/models/post.js';
import { uploadMedia } from '$lib/utils/cloudinary.js';

export async function POST({ request, locals }) {
    try {
        const userId = locals.user?.userId;
        if (!userId) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const caption = formData.get('caption');
        const mediaFiles = formData.getAll('mediaFiles');

        console.log('Received files:', mediaFiles.length);
        console.log('Caption:', caption);

        if (!mediaFiles.length) {
            return json({ error: 'At least one media file is required' }, { status: 400 });
        }

        // Handle media upload
        let mediaUrl = '';
        let type = 'image';
        let mediaUrls = [];

        if (mediaFiles.length > 1) {
            // Handle multiple files
            type = 'multiple';
            const uploadPromises = mediaFiles.map(file => uploadMedia(file));
            mediaUrls = await Promise.all(uploadPromises);
            mediaUrl = mediaUrls[0]; // First image as cover
        } else {
            // Handle single file
            mediaUrl = await uploadMedia(mediaFiles[0]);
            type = mediaFiles[0].type.startsWith('video/') ? 'video' : 'image';
        }

        const post = new Post({
            userId,
            caption,
            mediaUrl,
            mediaUrls: mediaUrls.length ? mediaUrls : [mediaUrl],
            type
        });

        await post.save();

        return json({
            success: true,
            post: {
                id: post._id.toString(),
                mediaUrl: post.mediaUrl,
                mediaUrls: post.mediaUrls,
                type: post.type,
                caption: post.caption,
                likes: 0,
                comments: 0,
                createdAt: post.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating post:', error);
        return json({ error: 'Failed to create post' }, { status: 500 });
    }
} 