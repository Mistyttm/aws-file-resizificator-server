import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from 'fs';
import path from 'path';
import { uploadToS3, getSignedUrl } from "./aws/s3Bucket";

const bucketName = process.env.BUCKET_NAME;
Ffmpeg.setFfmpegPath(ffmpegPath ?? "");

/* Encode client's uploaded video to the selected resolution */
export async function encodeVideo(filePath: string, outputName: string, resolution: string, fileType: string) {
    return new Promise((resolve, reject) => {
        console.log("Encoding video...");
        // Regex code generated from AI prompt to change filetype string format from 'video/mp4' to '.mp4'
        const fileExtension = fileType.replace(/^.*\//, '.');
        outputName =  outputName + fileExtension;
        const outputFilePath = path.join('output/encoded', outputName);
    
        Ffmpeg(filePath)
            .videoCodec('libx264')
            .size(resolution)
            .output(outputFilePath)
            .on('end', async () => {
            console.log('Video encoding complete.');
    
            // Get file path for encoded video output from disk storage
            const fileStream = fs.createReadStream(outputFilePath);
            const uploadParams = {
                Bucket: bucketName,
                Key: path.basename(outputFilePath),
                Body: fileStream,
                ContentType: fileType
            };
            try {
                await uploadToS3(uploadParams);
                // Specify object file information for identifying the encoded video stored in s3
                const signedUrlParams = {
                    Bucket: bucketName,
                    Key: path.basename(outputFilePath),
                    Expires: 60 * 20 // signed url valid for 20 minutes
                };

                // Create signed url for accessing encoded video from s3
                const signedUrl = await getSignedUrl(signedUrlParams);
                console.log("Signed URL: ", signedUrl);
                
                // Delete files from disk storage
                if (signedUrl) {
                    await removeFiles(filePath, outputFilePath);
                    resolve(signedUrl);
                } else {
                    console.error('Could not get signed url: ', Error);
                }

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

    async function removeFiles(originalVideoPath: string, encodedVideoPath: string) {
        try {
          if (fs.existsSync(originalVideoPath)) {
            fs.unlinkSync(originalVideoPath);
          } else {
            console.error('Error - File path for original video upload not found.');
          }
      
          if (fs.existsSync(encodedVideoPath)) {
            fs.unlinkSync(encodedVideoPath);
          } else {
            console.error('Error - File path for encoded video not found.');
          }
      
        } catch (error) {
          console.error(error);
        }
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
