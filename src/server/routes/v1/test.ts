//@ts-ignore
const express = require("express");
//@ts-ignore
const router = express.Router();

//@ts-ignore
router.get("/", (req, res) => {
    res.send("test")
});

