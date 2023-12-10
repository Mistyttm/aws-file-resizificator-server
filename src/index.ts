process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";

// Imports
import express from 'express';
const app = express();
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';

// Middleware imports
import { createS3bucket, setS3LifecyclePolicy } from '@middleware/aws/s3Bucket';
import { initliseQueues } from '@middleware/aws/sqs';

// Routes
import { routes } from './routes/v1';

const PORT = process.env.PORT ?? 8080;

// Middleware
app.use(express.static(path.join(__dirname, "front-end")));
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

// Routing
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "front-end", "index.html"));
});
app.get("/download", (req, res) => {
    res.sendFile(path.join(__dirname, "front-end", "index.html"));
});
app.use('/api/v1', routes);

/*Create s3 bucket and sqs queue (if not already created) 
upload bucket data and retrieve the bucket object */
(async () => {
    await createS3bucket();
    await setS3LifecyclePolicy();
    await initliseQueues();
})();

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
