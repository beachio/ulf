'use strict';

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const fbMessageType = require('./managers/fbMessageTypesManager');
const fbMessageHandler = require('./src/fbMessageHandler');

const app = express();


// Messenger API parameters
if (!config.FB_PAGE_TOKEN) {
	throw new Error('missing FB_PAGE_TOKEN');
}
if (!config.FB_VERIFY_TOKEN) {
	throw new Error('missing FB_VERIFY_TOKEN');
}
if (!config.API_AI_CLIENT_ACCESS_TOKEN) {
	throw new Error('missing API_AI_CLIENT_ACCESS_TOKEN');
}
if (!config.FB_APP_SECRET) {
	throw new Error('missing FB_APP_SECRET');
}
if (!config.SERVER_URL) { //used for ink to static files
	throw new Error('missing SERVER_URL');
}

app.set('port', (process.env.PORT || 5000));

//verify request came from facebook
let verifyRequestSignature = fbMessageHandler.verifyRequestSignature;

app.use(bodyParser.json({
	verify: verifyRequestSignature
}));

//serve static files in the public directory
app.use(express.static('public'));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', (req, res) => {
	res.send('Hello world, I am a chat bot');
});

// for Facebook verification
app.get('/webhook/', (req, res) => {
	console.log('request');
	if (req.query['hub.mode'] === 'subscribe'
	&& req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
		res.status(200).send(req.query['hub.challenge']);
	} else {
		console.error('Failed validation. Make sure the validation tokens match.');
		res.sendStatus(403);
	}
});

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page.
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook/', (req, res) => {
	const data = req.body;
	console.log(JSON.stringify(data));

	// Make sure this is a page subscription
	if (data.object === 'page') {
		// Iterate over each entry
		// There may be multiple if batched
		data.entry.forEach((pageEntry) => {
			// const pageID = pageEntry.id;
			// const timeOfEvent = pageEntry.time;

			// Iterate over each messaging event
			pageEntry.messaging.forEach((messagingEvent) => {
				if (messagingEvent.optin) {
					fbMessageHandler.receivedAuthentication(messagingEvent);
				} else if (messagingEvent.message) {
					fbMessageHandler.receivedMessage(messagingEvent);
				} else if (messagingEvent.delivery) {
					fbMessageHandler.receivedDeliveryConfirmation(messagingEvent);
				} else if (messagingEvent.postback) {
					fbMessageHandler.receivedPostback(messagingEvent);
				} else if (messagingEvent.read) {
					fbMessageHandler.receivedMessageRead(messagingEvent);
				} else if (messagingEvent.account_linking) {
					fbMessageHandler.receivedAccountLink(messagingEvent);
				} else {
					console.log('Webhook received unknown messagingEvent: ', messagingEvent);
				}
			});
		});

		// Assume all went well.
		// You must send back a 200, within 20 seconds
		res.sendStatus(200);
	}
});

const greetUserText = (userId) => {
	//first read user firstname
	request({
		uri: 'https://graph.facebook.com/v2.7/${userId}',
		qs: {
			access_token: config.FB_PAGE_TOKEN
		}
	}, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			const user = JSON.parse(body);
			if (user.first_name) {
					console.log('FB user: %s %s, %s',
					user.first_name, user.last_name, user.gender);
					const message = 'Welcome ${user.first_name}!';
				fbMessageType.sendTextMessage(userId, message);
			} else {
				console.log('Cannot get data for fb user with id',
					userId);
			}
		} else {
			console.error(response.error);
		}
	});
};

// Spin up the server
app.listen(app.get('port'), () => {
	console.log('running on port', app.get('port'));
});
