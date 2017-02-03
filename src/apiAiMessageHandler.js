const helpers = require('../helpers/helper');
const fbMessageType = require('../managers/fbMessageTypesManager');
const fbMessage = require('../managers/fbMessagesManager');

const handleMessage = (message, sender) => {
	switch (message.type) {
	case 0: { //text
		fbMessageType.sendTextMessage(sender, message.speech);
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
		fbMessageType.sendQuickReply(sender, message.title, replies);
		break;
	}
	case 3: {
		//image
		fbMessageType.sendImageMessage(sender, message.imageUrl);
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

		fbMessage.callSendAPI(messageData);

		break;
	}
	// no default
	}
};


const handleCardMessages = (messages, sender) => {
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
	fbMessageType.sendGenericMessage(sender, elements);
};


const handleApiAiResponse = (sender, response) => {
	const responseText = response.result.fulfillment.speech;
	const responseData = response.result.fulfillment.data;
	const messages = response.result.fulfillment.messages;
	const action = response.result.action;
	const contexts = response.result.contexts;
	const parameters = response.result.parameters;

	fbMessageType.sendTypingOff(sender);

	if (helpers.isDefined(messages) && (messages.length === 1 && messages[0].type !== 0
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
	} else if (responseText === '' && !helpers.isDefined(action)) {
		//api ai could not evaluate input.
		console.log('Unknown query ${response.result.resolvedQuery}');
		fbMessageType.sendTextMessage(sender, 'I&rsquo;m not sure what you want. Can you be more specific?');
	} else if (helpers.isDefined(action)) {
		handleApiAiAction(sender, action, responseText, contexts, parameters);
	} else if (helpers.isDefined(responseData) && helpers.isDefined(responseData.facebook)) {
		try {
			console.log('Response as formatted message ${responseData.facebook}');
			fbMessageType.sendTextMessage(sender, responseData.facebook);
		} catch (err) {
			fbMessageType.sendTextMessage(sender, err.message);
		}
	} else if (helpers.isDefined(responseText)) {
		fbMessageType.sendTextMessage(sender, responseText);
	}
};

const handleApiAiAction = (sender, action, responseText, contexts, parameters) => {
	switch (action) {
	case 0: {
		break;
	}
	default:
		//unhandled action, just send back the text
		fbMessageType.sendTextMessage(sender, responseText);
	}
};

module.exports = {
	handleMessage,
	handleCardMessages,
	handleApiAiResponse,
	handleApiAiAction
};
