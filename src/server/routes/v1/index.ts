import express from 'express';
import { filesRouter } from './filesRoute';
import { youtubeRouter } from './youtubeRoutes';

export const routes = express.Router();

routes.use("/files", filesRouter);
routes.use("/youtube", youtubeRouter);