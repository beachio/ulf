const config = require('../config.js');
const helpers = require('../helpers/helper.js');
const fbMessage = require('./fbMessagesManager');

const sendTextMessage = (recipientId, text) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text
		}
	};
	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
};

/*
 * Send a message with Quick Reply buttons.
 *
 */
const sendQuickReply = (recipientId, text, replies, metadata) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text,
			metadata: helpers.isDefined(metadata) ? metadata : '',
			quick_replies: replies
		}
	};

	fbMessage.callSendAPI(messageData);
};

/*
 * Send a read receipt to indicate the message has been read
 *
 */
const sendReadReceipt = (recipientId) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: 'mark_seen'
	};

	fbMessage.callSendAPI(messageData);
};

/*
 * Turn typing indicator on
 *
 */
const sendTypingOn = (recipientId) => {
	const messageData = {
		recipient: {
			id: recipientId
		},
		sender_action: 'typing_on'
	};

	fbMessage.callSendAPI(messageData);
};

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

	fbMessage.callSendAPI(messageData);
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

	fbMessage.callSendAPI(messageData);
};
