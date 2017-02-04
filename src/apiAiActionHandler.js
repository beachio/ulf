const helpers = require('../helpers/helper');
const fbMessageType = require('../managers/fbMessageTypesManager');

const handleApiAiAction = (sender, action, responseText, contexts, parameters) => {
	switch (action) {
	case 'personalised-welcome': {
		fbMessageType.sendTextMessage(sender, 'Hi there');
		fbMessageType.sendTypingOn(sender);
		setTimeout(function(){
		}, 2000);
		break;
	}
	default:
		//unhandled action, just send back the text
		fbMessageType.sendTextMessage(sender, responseText);
	}
};

module.exports = {
	handleApiAiAction
};
