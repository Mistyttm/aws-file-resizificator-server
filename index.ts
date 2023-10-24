const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('hbs');
const indexRouter = require('./routes/index');
const app = express();
const { createS3bucket, uploadJsonToS3, getObjectFromS3 } = require("./routes/middleware/s3Bucket");
const { createSQSQueue } = require("./routes/middleware/sqs");
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Initialise path for ffmpeg on start up
ffmpeg.setFfmpegPath('ffmpeg');

const PORT = process.env.PORT ?? 8080;

// Setup Handlebars as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

/*Create s3 bucket and sqs queue (if not already created) 
upload bucket data and retrieve the bucket object */
(async () => {
  await createS3bucket();
  await uploadJsonToS3();
  await getObjectFromS3();
  await createSQSQueue();
})();

module.exports = app;