const apiai = require('apiai');
const config = require('../config');

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
	language: 'en',
	requestSource: 'fb'
});

const sessionIds = new Map();

const isDefined = (obj) => {
	if (typeof obj === 'undefined') {
		return false;
	}

	if (!obj) {
		return false;
	}

	return obj != null;
};

module.exports = {
	isDefined,
	sessionIds,
	apiAiService
};
