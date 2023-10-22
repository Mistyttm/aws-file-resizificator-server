// Imports
import express from 'express';
const app = express();
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
var createError = require('http-errors');
// Routes
import { routes } from './routes/v1';

const PORT = process.env.PORT ?? 8080;

// Setup handlebars view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware
app.use(express.static(path.join(__dirname, "..", "..", "build", "app")));
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

// Routing
// note: Changed index.html to layout.hbs
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "build", "app", "layout.hbs"));
});

app.use('/api/v1', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });

// error handler
app.use(function(err: { message: any; status: any; }, req: { app: { get: (arg0: string) => string; }; }, res: { locals: { message: any; error: any; }; status: (arg0: any) => void; render: (arg0: string) => void; }, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
