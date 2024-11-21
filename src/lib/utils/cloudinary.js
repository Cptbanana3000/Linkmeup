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