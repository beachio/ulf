'use strict';

const apiai = require('apiai');
const config = require('./config');
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const uuid = require('uuid');


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

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: 'en',
	requestSource: 'fb'
});
const sessionIds = new Map();

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
					receivedAuthentication(messagingEvent);
				} else if (messagingEvent.message) {
					receivedMessage(messagingEvent);
				} else if (messagingEvent.delivery) {
					receivedDeliveryConfirmation(messagingEvent);
				} else if (messagingEvent.postback) {
					receivedPostback(messagingEvent);
				} else if (messagingEvent.read) {
					receivedMessageRead(messagingEvent);
				} else if (messagingEvent.account_linking) {
					receivedAccountLink(messagingEvent);
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

function receivedMessage(event) {
	const senderID = event.sender.id;
	// const recipientID = event.recipient.id;
	// const timeOfMessage = event.timestamp;
	const message = event.message;

	if (!sessionIds.has(senderID)) {
		sessionIds.set(senderID, uuid.v1());
	}
	//console.log("Received message for user %d and page %d at %d with message:",
	// senderID, recipientID, timeOfMessage);
	//console.log(JSON.stringify(message));

	const isEcho = message.is_echo;
	const messageId = message.mid;
	const appId = message.app_id;
	const metadata = message.metadata;

	// You may get a text or attachment but not both
	const messageText = message.text;
	const messageAttachments = message.attachments;
	const quickReply = message.quick_reply;

	if (isEcho) {
		handleEcho(messageId, appId, metadata);
		return;
	} else if (quickReply) {
		handleQuickReply(senderID, quickReply, messageId);
		return;
	}


	if (messageText) {
		//send message to api.ai
		sendToApiAi(senderID, messageText);
	} else if (messageAttachments) {
		handleMessageAttachments(messageAttachments, senderID);
	}
}


function handleMessageAttachments(messageAttachments, senderID) {
	//for now just reply
	sendTextMessage(senderID, 'Attachment received. Thank you.');
}

function handleQuickReply(senderID, quickReply, messageId) {
	const quickReplyPayload = quickReply.payload;
	console.log('Quick reply for message %s with payload %s', messageId, quickReplyPayload);
	//send payload to api.ai
	sendToApiAi(senderID, quickReplyPayload);
}

//https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
function handleEcho(messageId, appId, metadata) {
	// Just logging message echoes to console
	console.log('Received echo for message %s and app %d with metadata %s',
	messageId, appId, metadata);
}

function handleApiAiAction(sender, action, responseText, contexts, parameters) {
	switch (action) {
		default:
			//unhandled action, just send back the text
			sendTextMessage(sender, responseText);
	}
}

function handleMessage(message, sender) {
	switch (message.type) {
		case 0: { //text
			sendTextMessage(sender, message.speech);
			break;
		}
		case 2: {
			//quick replies
				const replies = [];
				for (let b = 0; b < message.replies.length; b++) {
					const reply =
					{
						content_type: 'text',
						title: message.replies[b],
						payload: message.replies[b]
					};
					replies.push(reply);
				}
				sendQuickReply(sender, message.title, replies);
				break;
		}
		case 3: {
			//image
				sendImageMessage(sender, message.imageUrl);
				break;
		}
		case 4: {
			// custom payload
			const messageData = {
				recipient: {
					id: sender
				},
				message: message.payload.facebook

			};

			callSendAPI(messageData);

			break;
		}
		// no default
	}
}


function handleCardMessages(messages, sender) {
	const elements = [];
	for (let m = 0; m < messages.length; m++) {
		const message = messages[m];
		const buttons = [];
		for (let b = 0; b < message.buttons.length; b++) {
			const isLink = (message.buttons[b].postback.substring(0, 4) === 'http');
			let button;
			if (isLink) {
				button = {
					type: 'web_url',
					title: message.buttons[b].text,
					url: message.buttons[b].postback
				};
			} else {
				button = {
					type: 'postback',
					title: message.buttons[b].text,
					payload: message.buttons[b].postback
				};
			}
			buttons.push(button);
		}

		const element = {
			title: message.title,
			image_url: message.imageUrl,
			subtitle: message.subtitle,
			buttons
		};
		elements.push(element);
	}
	sendGenericMessage(sender, elements);
}


function handleApiAiResponse(sender, response) {
	const responseText = response.result.fulfillment.speech;
	const responseData = response.result.fulfillment.data;
	const messages = response.result.fulfillment.messages;
	const action = response.result.action;
	const contexts = response.result.contexts;
	const parameters = response.result.parameters;

	sendTypingOff(sender);

	if (isDefined(messages) && (messages.length === 1 && messages[0].type !== 0
	&& messages.length > 1)) {
		const timeoutInterval = 1100;
		let previousType;
		let cardTypes = [];
		let timeout = 0;

		for (let i = 0; i < messages.length; i++) {
			if (previousType === 1 && (messages[i].type !== 1 || i === messages.length - 1)) {
				timeout = (i - 1) * timeoutInterval;
				setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
				cardTypes = [];
				timeout = i * timeoutInterval;
				setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
			} else if (messages[i].type === 1) {
				cardTypes.push(messages[i]);
			} else {
				timeout = i * timeoutInterval;
				setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
			}

			previousType = messages[i].type;
		}
	} else if (responseText === '' && !isDefined(action)) {
		//api ai could not evaluate input.
		console.log('Unknown query ${response.result.resolvedQuery}');
		sendTextMessage(sender, "I'm not sure what you want. Can you be more specific?");
	} else if (isDefined(action)) {
		handleApiAiAction(sender, action, responseText, contexts, parameters);
	} else if (isDefined(responseData) && isDefined(responseData.facebook)) {
		try {
			console.log('Response as formatted message ${responseData.facebook}');
			sendTextMessage(sender, responseData.facebook);
		} catch (err) {
			sendTextMessage(sender, err.message);
		}
	} else if (isDefined(responseText)) {
		sendTextMessage(sender, responseText);
	}
}

function sendToApiAi(sender, text) {
	sendTypingOn(sender);
	const apiaiRequest = apiAiService.textRequest(text, {
		sessionId: sessionIds.get(sender)
	});

	apiaiRequest.on('response', (response) => {
		if (isDefined(response.result)) {
			handleApiAiResponse(sender, response);
		}
	});

	apiaiRequest.on('error', (error) => console.error(error));
	apiaiRequest.end();
}

const sendTextMessage = (recipientId, text) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text
		}
	};
	callSendAPI(messageData);
};

/*
 * Send an image using the Send API.
 *
 */
const sendImageMessage = (recipientId, imageUrl) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'image',
				payload: {
					url: imageUrl
				}
			}
		}
	};

	callSendAPI(messageData);
};

/*
 * Send a Gif using the Send API.
 *
 */
const sendGifMessage = (recipientId) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'image',
				payload: {
					url: '${config.SERVER_URL}/assets/instagram_logo.gif'
				}
			}
		}
	};

	callSendAPI(messageData);
};

/*
 * Send audio using the Send API.
 *
 */
const sendAudioMessage = (recipientId) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'audio',
				payload: {
					url: '${config.SERVER_URL]/assets/sample.mp3'
				}
			}
		}
	};

	callSendAPI(messageData);
};

/*
 * Send a video using the Send API.
 * example videoName: "/assets/allofus480.mov"
 */
const sendVideoMessage = (recipientId, videoName) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'video',
				payload: {
					url: config.SERVER_URL + videoName
				}
			}
		}
	};

	callSendAPI(messageData);
};

/*
 * Send a video using the Send API.
 * example fileName: fileName"/assets/test.txt"
 */
const sendFileMessage = (recipientId, fileName) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'file',
				payload: {
					url: config.SERVER_URL + fileName
				}
			}
		}
	};

	callSendAPI(messageData);
};

/*
 * Send a button message using the Send API.
 *
 */
const sendButtonMessage = (recipientId, text, buttons) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'button',
					text,
					buttons
				}
			}
		}
	};

	callSendAPI(messageData);
};


const sendGenericMessage = (recipientId, elements) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'generic',
					elements
				}
			}
		}
	};

	callSendAPI(messageData);
};


const sendReceiptMessage = (recipientId, recipientName, currency, paymentMethod,
							timestamp, elements, address, summary, adjustments) => {
	// Generate a random receipt ID as the API requires a unique ID
	const receiptId = 'order${Math.floor(Math.random() * 1000)}';

	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'receipt',
					recipientName,
					order_number: receiptId,
					currency,
					paymentMethod,
					timestamp,
					elements,
					address,
					summary,
					adjustments
				}
			}
		}
	};

	callSendAPI(messageData);
};

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId, text, replies, metadata) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text,
			metadata: isDefined(metadata) ? metadata : '',
			quick_replies: replies
		}
	};

	callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: 'mark_seen'
	};

	callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
	const messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: 'typing_on'
	};

	callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
const sendTypingOff = (recipientId) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: 'typing_off'
	};

	callSendAPI(messageData);
};

/*
 * Send a message with the account linking call-to-action
 *
 */
const sendAccountLinking = (recipientId) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			attachment: {
				type: 'template',
				payload: {
					template_type: 'button',
					text: 'Welcome. Link your account.',
					buttons: [{
						type: 'account_link',
						url: '${config.SERVER_URL}/authorize'
          }]
				}
			}
		}
	};

	callSendAPI(messageData);
};


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
				sendTextMessage(userId, message);
			} else {
				console.log('Cannot get data for fb user with id',
					userId);
			}
		} else {
			console.error(response.error);
		}
	});
};

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
const callSendAPI = (messageData) => {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: config.FB_PAGE_TOKEN
		},
		method: 'POST',
		json: messageData

	}, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			const recipientId = body.recipient_id;
			const messageId = body.message_id;

			if (messageId) {
				console.log('Successfully sent message with id %s to recipient %s',
					messageId, recipientId);
			} else {
				console.log('Successfully called Send API for recipient %s',
					recipientId);
			}
		} else {
			console.error('Failed calling Send API',
			response.statusCode, response.statusMessage, body.error);
		}
	});
};

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
const receivedPostback = (event) => {
	const senderID = event.sender.id;
	const recipientID = event.recipient.id;
	const timeOfPostback = event.timestamp;

	// The 'payload' param is a developer-defined field which is set in a postback
	// button for Structured Messages.
	const payload = event.postback.payload;

	switch (payload) {
		default:
			//unindentified payload
			sendTextMessage(senderID, "I'm not sure what you want. Can you be more specific?");
			break;

	}

	console.log("Received postback for user %d and page %d with payload '%s' " +
		'at %d', senderID, recipientID, payload, timeOfPostback);
};


/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
const receivedMessageRead = (event) => {
	// const senderID = event.sender.id;
	// const recipientID = event.recipient.id;

	// All messages before watermark (a timestamp) or sequence have been seen.
	const watermark = event.read.watermark;
	const sequenceNumber = event.read.seq;

	console.log('Received message read event for watermark %d and sequence ' +
		'number %d', watermark, sequenceNumber);
};

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
const receivedAccountLink = (event) => {
	const senderID = event.sender.id;
	// const recipientID = event.recipient.id;

	const status = event.account_linking.status;
	const authCode = event.account_linking.authorization_code;

	console.log('Received account link event with for user %d with status %s ' +
		'and auth code %s ', senderID, status, authCode);
};

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
const receivedDeliveryConfirmation = (event) => {
	// const senderID = event.sender.id;
	// const recipientID = event.recipient.id;
	const delivery = event.delivery;
	const messageIDs = delivery.mids;
	const watermark = delivery.watermark;
	// const sequenceNumber = delivery.seq;

	if (messageIDs) {
		messageIDs.forEach((messageID) => {
			console.log('Received delivery confirmation for message ID: %s',
				messageID);
		});
	}

	console.log('All message before %d were delivered.', watermark);
};

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
	const senderID = event.sender.id;
	const recipientID = event.recipient.id;
	const timeOfAuth = event.timestamp;

	// The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
	// The developer can set this to an arbitrary value to associate the
	// authentication callback with the 'Send to Messenger' click event. This is
	// a way to do account linking when the user clicks the 'Send to Messenger'
	// plugin.
	const passThroughParam = event.optin.ref;

	console.log('Received authentication for user %d and page %d with pass ' +
		"through param '%s' at %d", senderID, recipientID, passThroughParam,
		timeOfAuth);

	// When an authentication is received, we'll send a message back to the sender
	// to let them know it was successful.
	sendTextMessage(senderID, 'Authentication successful');
}

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
	const signature = req.headers['x-hub-signature'];

	if (!signature) {
		throw new Error('Couldn\'t validate the signature.');
	} else {
		const elements = signature.split('=');
		// const method = elements[0];
		const signatureHash = elements[1];

		const expectedHash = crypto.createHmac('sha1', config.FB_APP_SECRET)
			.update(buf)
			.digest('hex');

		if (signatureHash !== expectedHash) {
			throw new Error("Couldn't validate the request signature.");
		}
	}
}

function isDefined(obj) {
	if (typeof obj === 'undefined') {
		return false;
	}

	if (!obj) {
		return false;
	}

	return obj != null;
}

// Spin up the server
app.listen(app.get('port'), () => {
	console.log('running on port', app.get('port'));
});
