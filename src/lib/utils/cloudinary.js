import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadAvatar(file) {
    try {
        // Convert the file buffer to base64
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileStr = `data:${file.type};base64,${fileBuffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'avatars',
            transformation: [
                { width: 400, height: 400, crop: 'fill' },
                { quality: 'auto' }
            ]
        });

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image');
    }
}

export async function deleteAvatar(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
    }
} 