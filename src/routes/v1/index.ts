import express from 'express';
import { filesRouter } from './filesRoute';

export const routes = express.Router();

routes.use("/files", filesRouter);
routes.use("/test", (req, res) => {
    res.json({status: "OK", message: "running"});
})
