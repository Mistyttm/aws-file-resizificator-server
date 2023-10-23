const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require("path");


async function encodeVideo(videoFile: any, resolution: any) {
    let status;
    try {
        const filePath = fs.createReadStream(videoFile.path);
        ffmpeg()
            .input(filePath)
            .videoCodec("libx264")
            .size(resolution)
            .output("test.mp4")
            .on("end", () => {
                status = "OK";
                console.log("Success - Video encoding complete.");
            })
            .on("error", (error: any) => {
                status = "ERROR";
                console.log(error);
            })
            .run();

        return status;

    } catch (error) {
        console.error("Error encoding video ", error);
    }
}

async function getThumbnail(videoFile: any) {
    let status;
    try {
        const filePath = fs.createReadStream(videoFile.path);
        ffmpeg()
            .input(filePath)
            .seekInput("5")
            .frames(1) 
            .output("thumbnail.png")
            .on("end", () => {
                status = "OK";
                console.log("Success - Thumbnail created.");
            })
            .on("error", (error: any) => {
                status = "ERROR";
                console.error("Error - could not create thumbnail ", error);
            })
            .run();

        return status;

        } catch (error) {
            console.error("Error creating thumbnail ", error);
        }
    }

module.exports = { encodeVideo, getThumbnail };