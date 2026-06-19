"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getS3Url = getS3Url;
exports.uploadImageToS3 = uploadImageToS3;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
function getS3Url(key) {
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
async function uploadImageToS3(base64, folder) {
    const mimeType = base64.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg';
    const extension = mimeType.split('/')[1];
    const clean = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(clean, 'base64');
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
    }));
    return key;
}
//# sourceMappingURL=s3Upload.service.js.map