import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from 'fs';
import path from "path";

if (ffmpegPath === null){
    throw new Error("FFMPEG not found. Please install the latest version of FFMPEG");
} else {
    Ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");
}


export default async function encodeVideo(videoFile: any, resolution: string) {
    let message = '';
    try {
        const absolutePath = path.resolve("src/server/videos/" + videoFile);
        const filePath = fs.createReadStream(absolutePath);
        const newFile = "src/server/videos/" + Date.now() + "_" + resolution + "_" + videoFile
        await new Promise((resolve, reject) => {
            Ffmpeg()
                .input(filePath)
                .videoCodec("libx264")
                .size(resolution)
                .output(newFile)
                .on("end", (video) => {
                    message = newFile;
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

export async function getThumbnail(videoFile: any) {
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
