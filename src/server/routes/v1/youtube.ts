import { Router } from "express";

export const youtubeRouter = Router();

youtubeRouter.get("/test", (req, res) => {
    res.json({status: "OK", message: "Test route"})
})