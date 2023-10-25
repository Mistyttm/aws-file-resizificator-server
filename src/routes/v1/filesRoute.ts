import { Router } from "express";
import upload from "../../middleware/multer"
import { pathToFileURL } from "bun";
import { encodeVideo, getThumbnail } from '../../middleware/ffmpeg';
import path from 'path';

export const filesRouter = Router();

let runCount = 0;

/* Upload video file from client */
filesRouter.post("/uploadFile", upload.single("video"), async (req, res) => {
    try {        
        if (!req.file) {
            res.render("index", { displayMessage: "Please select a video file to upload.", title: "Video Resizer" });
        }
        runCount++;
        console.log("Run count: ", runCount);

        const video = req.file;
        const resolution = req.body.resolution;

        const fileExtension = (req.file?.originalname ? path.extname(req.file.originalname).toLowerCase() : '');
        const validExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
        
        if (!validExtensions.includes(fileExtension)) {
            res.render("index", { displayMessage: "File must be of extension type: '.mp4', '.mov', '.avi' or '.mkv'.", title: "Video Resizer" });
        }
        
        console.log("Resolution: ",resolution);
        if (resolution != "None") {
            const outputName = "new" + "_" + runCount + "_" + video?.originalname;
            const encode = await encodeVideo(video, resolution, outputName);
            if (encode == "OK") {
                await getThumbnail(video);
                res.render("index", { displayMessage: "Success! Video was encoded.", title: "Video Resizer" });
            }

        } else {
            res.render("index", { displayMessage: "Please select a resolution.", title: "Video Resizer" });
        }
    } catch (error) {
        let displayMessage = error;
        res.render("index", { displayMessage, title: "Video Resizer" });
    }
});
