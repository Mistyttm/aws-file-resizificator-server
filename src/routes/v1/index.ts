import express from 'express';
import { filesRouter } from '@routes/v1/filesRoute';

export const routes = express.Router();

routes.use("/files", filesRouter);

