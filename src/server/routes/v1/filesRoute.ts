import { Router } from "express";
import upload from "../../middleware/multer"

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