import { Router } from "express";
import upload from "@middleware/multer";
import { randomBytes } from "crypto";
import { getQueueUrl, sourceQueueName, sendMessage } from "@middleware/aws/sqs";
import { encodedVideoUrl } from "@middleware/validator";
import { bucketName, getSignedUrl } from "@middleware/aws/s3Bucket";

export const filesRouter = Router();

/* Encode client's uploaded video to the specified resolution and upload result to s3 storage */
filesRouter.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(500).json({status: "error", message: "Error - No file upload found."});
    }
    
    if (!req.body.resolution) {
        return res.status(500).json({status: "error", message: "Error - Please select a resolution."});
    }

    // Create a random file name
    const fileName = randomBytes(64).toString("hex");

    try {
        const taskParams = {
            filePath: req.file.path,
            outputName: fileName,
            resolution: req.body.resolution,
            fileType: req.file.mimetype
        }

        // Get the name of SQS queue and send encoding task as message to queue
        const queueUrl = await getQueueUrl(sourceQueueName) ?? "";
        await sendMessage(taskParams, queueUrl);

        const fileExtension = taskParams.fileType.replace(/^.*\//, '.');

        res.json({status: "OK", message: taskParams.outputName + fileExtension});

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: "error", message: "Error - Request could not be processed."});
    }
});

/* Route to retireve the signed url from S3 to access encoded video */
filesRouter.get('/encodedVideo/:outputName', async (req, res) => {
    const { outputName } = req.params;

    const outputNameNoExten = outputName.replace(/\.[^/.]+$/, "");

    // Check the encoded video output name is avalible 
    // @ts-ignore
    if (encodedVideoUrl[outputNameNoExten]) {
        const signedUrlParams = { 
            Bucket: bucketName,
            Key: outputName, 
            Expires: 60 * 20 // Valid for 20 minutes
        };

        console.log(outputName);

        try {
            const signedUrl = await getSignedUrl(signedUrlParams);
            res.json({ status: 'OK', signedUrl: signedUrl });

        } catch (error) {
            console.error('Error creating signed URL: ', error);
            res.status(500).json({ status: 'error', message: 'Error - unable to create signed URL.' });
        }
    } else {
        res.status(404).json({ status: 'error', message: 'Please wait - your video is still being processed.' });
    }
});
