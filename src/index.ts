// Imports
import express from 'express';
const app = express();
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import 'hbs';

// middleware imports
import { createS3bucket, uploadJsonToS3, getObjectFromS3 } from './middleware/aws';
import { createSQSQueue } from './middleware/sqs'

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

// Setup Handlebars as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/', function(req, res) {
    res.render("index", { title: "Video Resizer" });
});

app.use('/api/v1', routes);

/*Create s3 bucket and sqs queue (if not already created) 
upload bucket data and retrieve the bucket object */
(async () => {
    await createS3bucket();
    await uploadJsonToS3();
    await getObjectFromS3();
    await createSQSQueue();
})();

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
