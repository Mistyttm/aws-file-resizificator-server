// Imports
import express from 'express';
const app = express();
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import ffmpegPath from 'ffmpeg-static';
import Ffmpeg from 'fluent-ffmpeg';

// middleware imports
import { createS3bucket, setS3LifecyclePolicy } from './middleware/aws/s3Bucket';
import { initliseQueues } from './middleware/aws/sqs';

// Routes
import { routes } from './routes/v1';

const PORT = process.env.PORT ?? 8080;

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";

// Middleware
app.use(express.static(path.join(__dirname, "..", "..", "build", "app")));
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));
Ffmpeg.setFfmpegPath(ffmpegPath ?? "");

// Routing
app.use('/api/v1', routes);

// app.use(function(req, res, next) {
//     next(createHttpError(404));
// });

// // error handler
// // @ts-ignore
// app.use(function(err, req, res, next) {
//     // set locals, only providing error in development
//     res.locals.message = err.message;
//     res.locals.error = req.app.get('env') === 'development' ? err : {};

//     // render the error page
//     res.status(err.status || 500);
//     res.render('error');
// });

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
