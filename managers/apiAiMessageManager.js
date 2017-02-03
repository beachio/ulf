const helpers = require('../helpers/helper');
const fbMessageType = require('../managers/fbMessageTypesManager');
const apiAiMessageHandler = require('../src/apiAiMessageHandler');

const sendToApiAi = (sender, text) => {
	fbMessageType.sendTypingOn(sender);
	const apiaiRequest = helpers.apiAiService.textRequest(text, {
		sessionId: helpers.sessionIds.get(sender)
	});

	apiaiRequest.on('response', (response) => {
		if (helpers.isDefined(response.result)) {
			apiAiMessageHandler.handleApiAiResponse(sender, response);
		}
	});

	apiaiRequest.on('error', (error) => console.error(error));
	apiaiRequest.end();
};

module.exports = {
	sendToApiAi
};
