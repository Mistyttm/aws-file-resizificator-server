import express from 'express';
import { filesRouter } from './filesRoute';

export const routes = express.Router();

routes.use(filesRouter);