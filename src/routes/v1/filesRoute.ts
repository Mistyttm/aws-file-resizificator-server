import { Router } from "express";
import upload from "../../middleware/multer";
import { randomBytes } from "crypto";
import { getQueueUrl, sourceQueueName, sendMessage } from "../../middleware/aws/sqs";

export const filesRouter = Router();


/* Encode client's uploaded video to the specified resolution and upload result to s3 storage */
filesRouter.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(500).json({status: "error", message: "Error - No file upload found."});
    }
    const fileName = randomBytes(64).toString("hex");

    try {
        const taskParams = {
            filePath: req.file.path,
            outputName: fileName,
            resolution: req.body.resolution,
            fileType: req.file.mimetype
        }
        const queueUrl = await getQueueUrl(sourceQueueName) ?? "";
        const message = await sendMessage(taskParams, queueUrl);

        res.json(message);

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: "Error - Request could not be processed."});
    }
});
