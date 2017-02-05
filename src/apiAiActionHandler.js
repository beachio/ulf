const helpers = require('../helpers/helper');
const fbMessageType = require('../managers/fbMessageTypesManager');
const fbProfile = require('../services/fbProfileService');
const onboarding = require('../stories/onboarding');

const handleApiAiAction = (sender, action, responseText, contexts, parameters) => {
	switch (action) {
	case 'personalised-welcome': {
		onboarding.startOnboarding(sender);
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
