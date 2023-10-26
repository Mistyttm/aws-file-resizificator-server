import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from 'fs';

Ffmpeg.setFfmpegPath(ffmpegPath ?? "");

export async function encodeVideo(s3Url: any, resolution: string, outputName: string) {
    try {
        // Ensure resolution is in the correct format
        const resolutionPattern = /^\d{2,4}x\d{2,4}$/;
        if (!resolutionPattern.test(resolution)) {
            return Promise.reject(new Error("Invalid resolution format. Use 'widthxheight', e.g., '1280x720'."));
        }
        let status = '';
        Ffmpeg()
                .input(s3Url)
                .videoCodec("libx264")
                .size(resolution)
                .output(outputName + ".mp4") //todo: add filename from mimetype, might use regex to format from "video/mp4" to ".mp4"
                .on("end", () => {
                    status = "OK";
                    console.log("Success - Video encoding complete.");
                })
                .on("error", (error) => {
                    status = "ERROR";
                    console.log(error);
                })
                .run();
        return status;

    } catch (error) {
        console.error("Error encoding video ", error);
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
