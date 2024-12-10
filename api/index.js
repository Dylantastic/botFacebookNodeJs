require("dotenv").config();
import express from "express";
import viewEngine from "../src/config/viewEngine";
import initWebroute from "../src/routes/web";
import bodyParser from "body-parser";

const app = express();

viewEngine(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


initWebroute(app);
app.get("/", (req, res) => {
    res.send("Hello, Vercel!");
});

export default async function handler(req, res) {
    await new Promise((resolve) => app.handle(req, res, resolve));
}