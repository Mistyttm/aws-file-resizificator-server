// Imports
import express from 'express';
const app = express();
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';

// Routes
import { routes } from './routes/v1';

const PORT = process.env.PORT ?? 8080;

// Middleware
app.use(express.static(path.join(__dirname, "..", "..", "build", "app")));
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

// Routing
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "build", "app", "index.html"));
});

app.use('/api/v1', routes);

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
