const uuid = require('uuid');
const helpers = require('../helpers/helper');
const apiAiMessage = require('../managers/apiAiMessageManager');
const fbMessageType = require('../managers/fbMessageTypesManager');
const siteMenu = require('../stories/siteMenu');

const receivedMessage = (event) => {
	const senderID = event.sender.id;
	// const recipientID = event.recipient.id;
	// const timeOfMessage = event.timestamp;
	const message = event.message;

	if (!helpers.sessionIds.has(senderID)) {
		helpers.sessionIds.set(senderID, uuid.v1());
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
		apiAiMessage.sendToApiAi(senderID, messageText);
	} else if (messageAttachments) {
		handleMessageAttachments(messageAttachments, senderID);
	}
};

const handleMessageAttachments = (messageAttachments, senderID) => {
	//for now just reply
	fbMessageType.sendTextMessage(senderID, 'Attachment received. Thank you.');
};

const handleQuickReply = (senderID, quickReply, messageId) => {
	const quickReplyPayload = quickReply.payload;
	console.log('Quick reply for message %s with payload %s', messageId, quickReplyPayload);
	//send payload to api.ai
	apiAiMessage.sendToApiAi(senderID, quickReplyPayload);
};

//https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
const handleEcho = (messageId, appId, metadata) => {
	// Just logging message echoes to console
	console.log('Received echo for message %s and app %d with metadata %s',
	messageId, appId, metadata);
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
	case 'SITE_CHANGE_SETTINGS': {
		siteMenu.siteSettingsMenu(senderID);
		break;
	}
	default:
			//unindentified payload
		fbMessageType.sendTextMessage(senderID, 'I&rsquo;m not sure what you want. Can you be more specific?');
		break;

	}

	console.log('Received postback for user %d and page %d with payload &rsquo;%s&rsquo; ' +
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
const receivedAuthentication = (event) => {
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
		'through param &rsquo;%s&rsquo; at %d', senderID, recipientID, passThroughParam,
		timeOfAuth);

	// When an authentication is received, we'll send a message back to the sender
	// to let them know it was successful.
	fbMessageType.sendTextMessage(senderID, 'Authentication successful');
};

module.exports = {
	receivedMessage,
	receivedPostback,
	receivedMessageRead,
	receivedAuthentication,
	receivedDeliveryConfirmation,
	receivedAccountLink
};
