import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from 'fs';
import path from 'path';
import { uploadToS3, getSignedUrl } from "./aws/s3Bucket";

const bucketName = process.env.BUCKET_NAME;

Ffmpeg.setFfmpegPath(ffmpegPath ?? "");

export async function encodeVideo(filePath: string, outputName: string, resolution: string, fileType: string) {
    return new Promise((resolve, reject) => {
        console.log("encoding video...");

        const fileExtension = fileType.replace(/^.*\//, '.');
        outputName =  outputName + fileExtension;
        const outputFilePath = path.join('output/encoded', outputName);
    
        Ffmpeg(filePath)
            .videoCodec('libx264')
            .size(resolution)
            .output(outputFilePath)
            .on('end', async () => {
            console.log('Video encoding complete.');
    
            // Upload the encoded video to S3
            const fileStream = fs.createReadStream(outputFilePath);
            const uploadParams = {
                Bucket: bucketName,
                Key: path.basename(outputFilePath),
                Body: fileStream,
                ContentType: fileType
            };
            try {
                await uploadToS3(uploadParams);
                // Get signed s3 url
                const signedUrlParams = {
                Bucket: bucketName,
                Key: path.basename(outputFilePath),
                Expires: 60 * 20 // url valid for 20 minutes
                };

                // Upload encoded video to s3 url
                const url = await getSignedUrl(signedUrlParams);
                console.log("Signed URL: ", url);
    
                // Delete file from disk storage
                fs.unlinkSync(outputFilePath);
                resolve(url);

            } catch (error) {
                console.error('Error uploading to S3: ', error);
                reject(error);
            }
            })
            .on('error', (error) => {
            console.error('Error encoding video: ', error);
            reject(error);
            })
            .run();
        });
    }

export async function getThumbnail(videoFile: any) {
    try {
        let status = '';
        const filePath = fs.createReadStream(videoFile.path);
        await new Promise((resolve, reject) => {
            Ffmpeg()
                .input(filePath)
                .seekInput("5")
                .frames(1) 
                .output("thumbnail.png")
                .on("end", () => {
                    status = "OK";
                    console.log("Success - Thumbnail created.");
                })
                .on("error", (error) => {
                    status = "ERROR";
                    console.error("Error - could not create thumbnail ", error);
                })
                .run();
        });
        return status;

    } catch (error) {
        console.error("Error creating thumbnail: ", error);
    }
}
