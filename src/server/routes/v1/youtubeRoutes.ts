import { Router } from "express";
import assert from "assert";
import { google } from "googleapis";

export const youtubeRouter = Router();

youtubeRouter.get("/test", (req, res) => {
    const video = req.query.v
    const thumbnail = req.query.t

    // Checking all queries exist
    if (video == undefined){
        res.json({status: "Fail", message: "No video specified"});
    }
    if (thumbnail === undefined){
        res.json({status: "Fail", message: "No thumbnail specified"});
    }

    // video category IDs for YouTube:
    const categoryIds = {
        Education: 27
    }

    // If modifying these scopes, delete your previously saved credentials in client_oauth_token.json
    const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
    const TOKEN_PATH = '../../';

    const videoFilePath = '../vid.mp4'
    const thumbFilePath = '../thumb.png'
})