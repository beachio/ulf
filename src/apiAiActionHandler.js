const fbMessageType = require('../managers/fbMessageTypesManager');

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
	handleApiAiAction
};
