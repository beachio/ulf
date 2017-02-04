const helpers = require('../helpers/helper');
const fbMessageType = require('../managers/fbMessageTypesManager');

const handleApiAiAction = (sender, action, responseText, contexts, parameters) => {
	switch (action) {
	case 'personalised-welcome': {
		if (helpers.isDefined(contexts[0] && contexts[0].name == 'default-welcome')) {
			fbMessageType.messageManager.sendTextMessage(sender, 'Hi there');
			fbMessageType.messageManager.sendTypingOn(sender);
			setTimeout(function(){

			}, 2000);

		} else {
			fbMessageType.messageManager.sendTextMessage(sender, 'Bonjour');
		}
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
