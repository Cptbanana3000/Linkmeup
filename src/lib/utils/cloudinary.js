import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadAvatar(file) {
    try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileStr = `data:${file.type};base64,${fileBuffer.toString('base64')}`;

        // Simple optimization for avatars
        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'avatars',
            transformation: [
                { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                { quality: 'auto:eco' }, // Use eco mode for smaller file size
                { fetch_format: 'auto' }  // Auto select best format
            ]
        });

        // Return both URL and public_id
        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image');
    }
}

export async function uploadMedia(file) {
    try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileStr = `data:${file.type};base64,${fileBuffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'posts',
            resource_type: 'auto', // Automatically detect if it's image or video
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload media');
    }
}

export async function deleteMedia(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw new Error('Failed to delete media');
    }
}

// Helper to extract public ID from URL
export function getPublicIdFromUrl(url) {
    try {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        return `posts/${publicId}`; // Adjust folder name if needed
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
} 