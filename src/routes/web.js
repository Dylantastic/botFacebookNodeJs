import express from "express";
import homepageController from "../controllers/homepageController";
import chatBotController from "../controllers/chatBotController";
let router = express.Router();

let initWebroutes = (app) => {

    router.get("/", homepageController.getHomePage);
    router.get("/webhook", chatBotController.getWebhook);
    router.post("/webhook", chatBotController.postWebhook);
  return app.use("/", router);
};

module.exports = initWebroutes;