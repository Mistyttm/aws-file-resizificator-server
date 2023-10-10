//@ts-ignore
const express = require("express");
const router = express.Router();

//@ts-ignore
router.get("/", (req, res) => {
    res.send("test")
});

module.exports = router;
