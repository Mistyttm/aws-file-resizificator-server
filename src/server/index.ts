import express from 'express';
const app = express();
import cors from 'cors';
import morgan from 'morgan';

const PORT = process.env.PORT ?? 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

app.get("/", (req, res) => {
    res.send("Hello World <3");
});

app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});