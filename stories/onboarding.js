const config = require('../config');
const fbMessageType = require('.../managers/fbMessageTypesManager');

const startOnboarding = (userId) => {
	const messageOne = 'Hi. My name is ' + config.BOT_NAME;
	const messageTwo = 'I am at your service';
	const messageThree = 'I am here to help you build and manage your web projects';
	const messageFour = 'Tell me the name of the town or city where you live...';
	const image = config.SERVER_URL + '/assets/picniq-screen.jpg';

	fbMessageType.sendImageMessage(userId, image);
	fbMessageType.sendTextMessage(userId, messageOne);
	setTimeout(function(){
		fbMessageType.sendTextMessage(userId, messageTwo);
		fbMessageType.sendTypingOn(userId);
	}, 1000);
	setTimeout(function(){
		fbMessageType.sendTextMessage(userId, messageThree);
		fbMessageType.sendTypingOn(userId);
	}, 2000);
	setTimeout(function(){
		let replies = [
			{
				content_type: 'location'
			}
		];
		fbMessageType.sendQuickReply(userId, messageFour, replies);
	}, 3000);
};
