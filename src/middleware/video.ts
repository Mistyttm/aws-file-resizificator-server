import ffmpegPath from "ffmpeg-static";
import Ffmpeg from "fluent-ffmpeg";

Ffmpeg.setFfmpegPath(ffmpegPath ?? "");

export async function getVideo(videoFile: any, filePath: string) {
    console.log(videoFile);
    videoFile.mv(filePath, function (error: any) {
        if (error) { 
            console.log(error);
        } else {
            console.log("Video imported");
            //todo: need to add a handler to validate the file is a video type
        }
    });
}

// Todo: Probably add uploads back to s3 directly in encoding function
export function encodeVideo(s3Url: string, outputName: string, resolution: string) {
    // TODO: download file from S3
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
