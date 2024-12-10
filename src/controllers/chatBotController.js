require("dotenv").config();
import request from "request";

let postWebhook = (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

};
const config = require("../config.js" +
    ""); // Adjust path as necessary

let getWebhook = (req, res) => {
    let VERIFY_TOKEN = process.env.MY_VERIFY_FB_TOKEN;
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
// Function to set up the "Get Started" button
const setupGetStartedButton = () => {
    const request_body = {
        "get_started": { "payload": "GET_STARTED" }
    };

    request({
        "uri": `https://graph.facebook.com/v6.0/me/messenger_profile?access_token=${process.env.FB_PAGE_TOKEN}`,
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log("Get Started button setup complete!");
        } else {
            console.error("Unable to set Get Started button:", err);
        }
    });
};

// Call setup function once the bot starts
setupGetStartedButton();

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {
        const userMessage = received_message.text.toLowerCase();

        // Add specific responses
        if (userMessage === "hello" || userMessage === "hi") {
            response = {
                "text": `Hi there! Welcome to our Banking Chatbot. Here are some options you can ask about:
1. Loans
2. Account Services
3. Bank Timings`
            };
        } else if (userMessage.includes("loan")) {
            response = {
                "text": `We offer several types of loans:
1. Personal Loan
2. Home Loan
3. Car Loan

Reply with the type of loan you're interested in!`
            };
        } else {
            // Default response
            response = {
                "text": `I'm sorry, I didn't understand that. You can ask me about loans, account services, or bank timings.`
            };
        }
    } else if (received_message.attachments) {
        // Handle attachments
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

// Sends the response message
    callSendAPI(sender_psid, response);

}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;
// Get the payload for the postback
    let payload = received_postback.payload;

    // Handle the "Get Started" postback
    if (payload === 'GET_STARTED') {
        response = {
            "text": `Welcome to our Banking Chatbot! Here are some options:
1. Learn about Loans
2. Check Account Services
3. Bank Timings

Please reply with the number of your choice.`
        };
    } else if (payload === 'yes') {
        response = { "text": "Thanks!" };
    } else if (payload === 'no') {
        response = { "text": "Oops, try sending another image." };
    } else {
        response = { "text": "I'm sorry, I didn't understand that." };
    }

    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": process.env.FB_PAGE_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    });

}
module.exports = {
    postWebhook: postWebhook,
    getWebhook: getWebhook
};