const express = require('express');
const router = express.Router();
const multer = require("multer");
const path = require("path");

/* Upload files from disk storage */
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, 'videos');
    },
    filename: (req: any, file: any, cb: any) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

/* Check file has valid video extension type */ 
const isVideo = function (req: any, file: any, cb: any) {
    const validExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (validExtensions.includes(fileExtension)) {
        cb(null, true);
    } else { 
        // If file extension invalid
        cb(false);
    }
}; 

const upload = multer({ storage: storage, fileFilter: isVideo});

module.exports = { upload };