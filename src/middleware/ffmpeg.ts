import Ffmpeg from "fluent-ffmpeg";
import fs from 'fs';
import path from "path";

export async function encodeVideo(videoFile: any, resolution: string, outputName: string) {
    try {
        let status = '';
        const absolutePath = path.resolve("src/videos/" + videoFile);
        const filePath = fs.createReadStream(absolutePath);
        Ffmpeg()
                .input(filePath)
                .videoCodec("libx264")
                .size(resolution)
                .output("src/videos/" + outputName)
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
