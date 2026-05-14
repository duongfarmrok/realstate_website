import cloudinary from '../config/cloudinary.js'
/* cSpell:disable-next-line */
import streamifier from 'streamifier'


export const uploadToCloudinary = (buffer,folder ="general") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(stream);
}
    );
}