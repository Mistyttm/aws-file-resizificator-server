const Ffmpeg = require("fluent-ffmpeg");
const fs = require('fs');
const path = require("path");

/* Encode video resolution */
export default async function encodeVideo(videoFile: any, resolution: string) {
    let message = '';

    try {
        // Set file paths
        const absolutePath = path.resolve("src/videos/" + videoFile);
        const filePath = fs.createReadStream(absolutePath);
        const newFile = "src/videos/" + Date.now() + "_" + resolution + "_" + videoFile;
        
        // Encode video
        Ffmpeg()
            .input(filePath)
            .videoCodec("libx264")
            .size(resolution)
            .output(newFile)
            .on("end", (video: any) => {
                // Send encoded video as message to server
                message = video;
            })
            .on("error", (error: any) => {
                message = "Error encoding video: " + error;
            })
            .run();

        return message;
    } catch (error) {
        console.error("Error encoding video: ", error);
    }
}

/* Create video thumbnails */
export async function getThumbnail(videoFile: any) {
    let message = '';

    try {
        // Set file paths
        const absolutePath = path.resolve("src/videos/" + videoFile);
        const filePath = fs.createReadStream(absolutePath);
        const outputFile = "src/thumbnails/" + Date.now() + "_" + "thumbnail" + "_" + videoFile;

        // Create thumbnail images from video screenshots
        await new Promise((resolve, reject) => {
            Ffmpeg()
                .takeScreenshots({
                    count: 1, // Take 1 screenshot
                    timemarks: ['10'], // 10 seconds into video
                })
                .output(outputFile)
                .on("end", (video: any) => {
                    message = "Thumbnail successfully created.";
                    resolve(video);
                })
                .on("error", (error: any) => {
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
