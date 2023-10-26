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
