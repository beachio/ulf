const request = require('request');
const config = require('../helpers/helper');
const fbMessageType = require('../managers/fbMessageTypesManager');

const greetUserText = (userId) => {
	//first read user firstname
	console.log('fetching info from Facebook');
	request({
		uri: 'https://graph.facebook.com/v2.7/%s', userId,
		qs: {
			access_token: config.FB_PAGE_TOKEN
		}
	}, (error, response, body) => {
		if (!error && response.statusCode === 200) {
			const user = JSON.parse(body);
			if (user.first_name) {
				console.log('FB user: %s %s, %s',
				user.first_name, user.last_name, user.gender);
				const message = 'Welcome ${user.first_name}!';
				fbMessageType.sendTextMessage(userId, message);
			} else {
				console.log('Cannot get data for fb user with id',
					userId);
			}
		} else {
			console.error('Error is %s', response.error);
		}
	});
};

module.exports = {
	greetUserText
};
