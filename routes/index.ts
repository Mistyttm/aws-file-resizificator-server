const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require('fs');
const { upload } = require("./middleware/multer");
const { encodeVideo, getThumbnail } = require("./middleware/ffmpeg");

/* GET home page. */
router.get('/', function(req: any, res: any) {
    res.render("index", { title: "Video Resizer" });
});

/* Upload and encode video */
router.post("/uploadFile", upload.single("video"), async (req: any, res: any) => {
    try {        
        if (!req.file) {
          res.render("index", { displayMessage: "Please select a video file to upload.", title: "Video Resizer" });
        }
        const video = req.file;
        const resolution = req.body.resolution;

        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const validExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
        
        if (!validExtensions.includes(fileExtension)) {
          res.render("index", { displayMessage: "File must be of extension type: '.mp4', '.mov', '.avi' or '.mkv'.", title: "Video Resizer" });
        }
  
        if (resolution != "None") {
          const encode = await encodeVideo(video, resolution);
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

module.exports = router;