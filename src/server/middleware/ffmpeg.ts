import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from 'fs';

if (ffmpegPath === null){
    throw new Error("FFMPEG not found. Please install the latest version of FFMPEG");
} else {
    Ffmpeg.setFfmpegPath(ffmpegPath);
}


async function encodeVideo(videoFile: any, resolution: string) {
    let message = '';
    try {
        const filePath = fs.createReadStream(videoFile.path);

        await new Promise((resolve, reject) => {
            Ffmpeg()
                .input(filePath)
                .videoCodec("libx264")
                .size(resolution)
                .output("test.mp4")
                .on("end", (video) => {
                    message = "Video encoding complete";
                    resolve(video);
                })
                .on("error", (error) => {
                    message = "Error encoding video: " + error;
                    reject(error);
                })
                .run();
        });
        return message;

    } catch (error) {
        console.error("Error encoding video ", error);
    }
}

async function getThumbnail(videoFile: any) {
    let message = '';

    try {
        const filePath = fs.createReadStream(videoFile.path);
        
        await new Promise((resolve, reject) => {
            Ffmpeg()
                .input(filePath)
                .seekInput("5")
                .frames(1) 
                .output("thumbnail.png")
                .on("end", (video) => {
                    message = "Thumbnail successfully created.";
                    resolve(video);
                })
                .on("error", (error) => {
                    message = "Error creating thumbnail: " + error;
                    reject(error);
                })
                .run();
        });
        return message;

    } catch (error) {
        console.error("Error creating thumbnail: ", error);
    }
}