import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from 'fs';

Ffmpeg.setFfmpegPath(ffmpegPath ?? "");

/*Todo: Probably add uploads back to s3 directly in encoding function */
export function encodeVideo(s3Url: string, outputName: string, resolution: string) {
    console.log(s3Url);
    return new Promise((resolve, reject) => {
        Ffmpeg()
            .input(s3Url) 
            .videoCodec("libx264")
            .size(resolution)
            .output(outputName + ".mp4") //todo: add filename from mimetype, might use regex to format from "video/mp4" to ".mp4"
            .on("end", (video) => {
                // todo: add s3 upload here
                console.log("Video encoding complete");
                resolve(video);
            })
            .on("error", (error) => {
                console.error("Error encoding video: ", error);
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
