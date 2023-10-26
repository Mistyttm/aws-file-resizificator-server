import { Router } from "express";
import * as AWS from 'aws-sdk';
import upload from "../../middleware/multer";
import { randomBytes } from "crypto";
import { encodeVideo } from '../../middleware/ffmpeg';
import { uploadToS3 } from "../../middleware/aws";

export const filesRouter = Router();
const bucketName = process.env.BUCKET_NAME
const s3Bucket = new AWS.S3();

/* Upload client video */
filesRouter.post("/upload", upload.single("video"), async (req, res) => {
    try {
        const resolution = req.body.resolution;
        // Generate random file name
        const fileName = randomBytes(64).toString("hex");
    
        // Upload the original video to s3 bucket
        const command = await uploadToS3(fileName, req.file?.buffer, req.file?.mimetype);
        const outputName = "encoded_" + "resolution" + fileName;
    
        try {
            // Get the signed URL of the file uploaded to S3
            const signedUrl = await new Promise<string>((resolve, reject) => {
                s3Bucket.getSignedUrl(
                    "getObject",
                    {
                        Bucket: bucketName,
                        Key: fileName,
                        Expires: 60 * 5,
                        ResponseContentType: req.file?.mimetype,
                    },
                    (error, url) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(url);
                        }
                    }
                );
            });
            // Encode the video from the signed URL to the client's selected resolution choice
            await encodeVideo(signedUrl, resolution, outputName);
        } catch (error) {
            console.error(error);
            // Handle the error as needed
        }
        res.json({status: "OK", file: fileName, message: "Video successfully resized"});
    } catch (error) {
        console.error(error);
        res.status(500).json({status: "error", message: error})
    }
});
