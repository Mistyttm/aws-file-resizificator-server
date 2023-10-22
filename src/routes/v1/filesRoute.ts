import { Router } from "express";
import upload from "../../middleware/multer"
import { pathToFileURL } from "bun";
import encodeVideo from '../../middleware/ffmpeg';

export const filesRouter = Router();

/* Upload video file from client */
filesRouter.post("/uploadFile", upload.single("video"), (req, res) => {
    try {        
        console.log(req.file);
        res.json({status: "OK", message: "File uploaded successfully"});
    } catch (error) {
        console.log("Error - unable to import video ", error);
        res.status(500).json({ status: "Error", message: "Unable to import video" });
    }
});

filesRouter.post("/tempRes", async (req, res) => {
    if (!req.body.video){
        res.json({status: "error", message: "You have not provided a video file"});
    }
    if(!pathToFileURL("../../videos/" + req.body.video.toString())){
        res.status(500).json({status: "error", message: "File does not exist"});
    }
    if (!req.body.resolution){
        res.status(500).json({status: "error", message: "You have not provided adequate resolutions"});
    }

    const video = req.body.video;
    const resolution = req.body.resolution;

    try {
        await encodeVideo(video, resolution).then(response => {
            res.json({status: "OK", message: "Encoding complete", file: response});
        });
    }
    catch (error) {
        res.status(500).json({status: "error", message: error})
    }
})