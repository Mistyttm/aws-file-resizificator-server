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
    // Define valid extensions types
    const validExtensions = ['.mp4', '.mov', '.avi', '.mkv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Check if uploaded file path includes valid extension type
    if (validExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        // Invalid type
        cb(null, false);
    }
}; 

const upload = multer({ storage: storage, fileFilter: isVideo});

module.exports = { upload };