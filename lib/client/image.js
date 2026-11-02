import { LOGO_PATTERN, MAX_LOGO_LENGTH, MAX_UPLOAD_BYTES } from '../shared.js';
/** Decode a local raster image and store only a small, inert PNG thumbnail. */
export async function prepareLogo(file) {
    if (file.size > MAX_UPLOAD_BYTES)
        throw new Error('tooLarge');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
        throw new Error('uploadFailed');
    const url = URL.createObjectURL(file);
    try {
        const image = new Image();
        image.src = url;
        await image.decode();
        if (!image.naturalWidth || !image.naturalHeight)
            throw new Error('uploadFailed');
        if (Math.max(image.naturalWidth, image.naturalHeight) > 4096)
            throw new Error('dimensions');
        const scale = Math.min(1, 128 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context)
            throw new Error('uploadFailed');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/png');
        if (data.length > MAX_LOGO_LENGTH || !LOGO_PATTERN.test(data))
            throw new Error('uploadFailed');
        return data;
    }
    finally {
        URL.revokeObjectURL(url);
    }
}
