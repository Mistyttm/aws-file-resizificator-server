import { Router } from "express";
import { upload } from 'youtube-videos-uploader'

export const youtubeRouter = Router();

youtubeRouter.post("/upload", (req, res) => {
    const video = req.query.v
    const thumbnail = req.query.t
    const email = process.env.YOUTUBE_EMAIL;
    const pass = process.env.YOUTUBE_PASS;
    const recoveryEmail = process.env.YOUTUBE_RECOVERY;

    // Checking all queries exist
    if (video == undefined){
        res.json({status: "Fail", message: "No video specified"});
    }
    if (thumbnail === undefined){
        res.json({status: "Fail", message: "No thumbnail specified"});
    }
    
    // Credentials to pass through to youtube
    const credentials = { email: email?.toString(), pass: pass?.toString(), recoveryemail: recoveryEmail?.toString() }

    const video1 = { path: 'src/server/videos/' + video, title: video, description: video, thumbnail: 'src/server/pictures/' + thumbnail}

    const onVideoUploadSuccess = (videoUrl: string) => {
        res.json({status: "OK", message: "video uploaded successfully", URL: videoUrl});
    }
    
    try {
        // TODO: update executable path to be suitable for docker when deploying
        // @ts-ignore
        await upload (credentials, [video1], {executablePath: '/usr/bin/google-chrome-stable'}).then(onVideoUploadSuccess)
    } catch (error) {
        res.status(500).json({status: "error", message: error});
    }
})