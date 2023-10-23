const express = require('express');
const router = express.Router();
const { pathToFileURL } = require("bun");
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { upload } = require("./middleware/multer");
const { encodeVideo, getThumbnail } = require("./middleware/ffmpeg");

/* GET home page. */
router.get('/', function(req: any, res: { render: (arg0: string, arg1: { title: string; }) => void; }, next: any) {
    res.render('index', { title: 'Video Resizer' });
});

/* Upload video file */
router.post("/uploadFile", upload.single("video"), (req: { file: any; }, res: { json: (arg0: { status: string; message: string; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { status: string; message: string; }): void; new(): any; }; }; }) => {
    try {        
        console.log(req.file);
        res.json({status: "OK", message: "File uploaded successfully"});
    } catch (error) {
        console.log("Error - unable to import video ", error);
        res.status(500).json({ status: "Error", message: "Unable to import video" });
    }
});

/* Encode uploaded video to selected resolution */
router.post("/tempRes", async (req: { body: { video: { toString: () => string; }; resolution: any; }; }, res: { json: (arg0: { status: string; message: string; file?: string | undefined; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { status: string; message: unknown; }): void; new(): any; }; }; }) => {
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
        await encodeVideo(video, resolution).then((response: any) => {
            res.json({status: "OK", message: "Encoding complete", file: response});
        });
    }
    catch (error) {
        res.status(500).json({status: "error", message: error})
    }
})

module.exports = router;