//@ts-ignore
const express = require("express");
//@ts-ignore
const router = express.Router();
//@ts-ignore
const fileUpload = require('express-fileupload');

/* Upload video file from client */
// These req and res types are what vs code added in for now to make typescript stop complaining about implicit types
router.post("/uploadFile", (req: { body: any; }, res: { json: (arg0: { status: string; message: string; }) => void; }) => {
    console.log("testing from uploadFile route");
    try {
        
        console.log("test file upload ", req.body);
        res.json({ status: "Ok", message: "Success" });
    } catch (error) {
        console.error("Error fetching geolocation", error);
    }
});

module.exports = router;
