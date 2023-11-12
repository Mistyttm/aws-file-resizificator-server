import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from 'fs';
import path from 'path';

Ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

/* Encode client's uploaded video to the selected resolution */
export async function encodeVideo(filePath: string, outputName: string, resolution: string, fileType: string) {
    return new Promise((resolve, reject) => {
        console.log("Encoding video...");
        // Regex code generated from AI prompt to change filetype string format from 'video/mp4' to '.mp4'
        const fileExtension = fileType.replace(/^.*\//, '.');
        const outputFilePath = path.join('output/encoded', outputName + fileExtension);
        Ffmpeg(filePath)
            .videoCodec('libx264')
            .size(resolution)
            .output(outputFilePath)
            .on('end', async () => {
                console.log('Video encoding complete.');
                // Resolve with encoded video details
                resolve({  outputFilePath, outputKey: path.basename(outputFilePath), contentType: fileType }); 
            })
            .on('error', (error) => {
            console.error('Error encoding video: ', error);
            reject(error);
            })
            .run();
        });
    }
