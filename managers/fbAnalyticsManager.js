const request = require('request');
const config = require('../config.js');
// const helpers = require('../helpers/helpers.js');

const trackGenericEvent = (event, recipientId) => {
	request.post({
		url : 'https://graph.facebook.com/${config.FB_APP_ID}/activities',
		form: {
			event: 'CUSTOM_APP_EVENTS',
			custom_events: JSON.stringify([{
				_eventName: event
			}]),
			advertiser_tracking_enabled: 0,
			application_tracking_enabled: 0,
			extinfo: JSON.stringify(['mb1']),
			page_id: config.FB_APP_ID,
			page_scoped_user_id: recipientId
		}
	}, function(err,httpResponse,body){
		console.error(err);
		console.log(httpResponse.statusCode);
		console.log(body);
	});
};

module.exports = {
	trackGenericEvent
};
