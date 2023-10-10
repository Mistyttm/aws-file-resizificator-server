import express from 'express';
const app = express();
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';

const PORT = process.env.PORT ?? 8080;

app.use(express.static(path.join(__dirname, "..", "app", "dist")));
app.use(express.static("public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "app", "dist", "index.html"));
});

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});
