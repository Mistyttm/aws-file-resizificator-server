import { Router } from "express";
import path from "path";
import { UploadedFile } from 'express-fileupload'

import getVideo from "../../middleware/video";

export const filesRouter = Router();

/* Upload video file from client */
// These req and res types are what vs code added in for now to make typescript stop complaining about implicit types
filesRouter.post("/uploadFile", async (req, res) => {
    const videoFile = req.files?.video as UploadedFile;

    try {
        // Get the path of the imported file
        const filePath = path.join(__dirname, '..', '..', 'videos', videoFile.name);

        // Call the function to store the video
        await getVideo(videoFile, filePath);

        res.json({status: "OK", message: "File uploaded successfully"});
    } catch (error) {
        console.log("Error - unable to import video ", error);
        res.status(500).json({ status: "Error", message: "Unable to import video" });
    }
});