const express = require('express');
const router = express.Router();

export const youtubeRouter = router();

youtubeRouter.post("/upload", (req: any, res: any) => {
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

    const video1 = { path: 'src/videos/' + video, title: video, description: video, thumbnail: 'src/pictures/' + thumbnail}

    const onVideoUploadSuccess = (videoUrl: string) => {
        res.json({status: "OK", message: "video uploaded successfully", URL: videoUrl});
    }
    console.log("uploading to youtube");
    // @ts-ignore
    upload (credentials, [video1], {executablePath: '/usr/bin/google-chrome-stable'}).then(onVideoUploadSuccess)
})