let postWebhook = (req, res) => {
    let body = req.body;

        if (body.object === "page") {
           body.entry.forEach(function (entry) {
               let webhook_event = entry.messaging[0];
               console.log(webhook_event);
           });

           res.status(200).send('EVENT_RECEIVE');
        } else {
            // Return a '404 Not Found' if event is not from a page subscription
            res.sendStatus(404);
        }

};
const config = require("../config.js" +
    ""); // Adjust path as necessary

let getWebhook = (req, res) => {
    // Parse the query params
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === config.verifyToken) {
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};
module.exports = {
    postWebhook: postWebhook,
    getWebhook: getWebhook
};