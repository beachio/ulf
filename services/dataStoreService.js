var Parse = require('parse/node');
var config = require('../config.js');
var helpers = require('../helpers/helper.js');

Parse.initialize(config.PARSE_APP_ID, config.PARSE_MASTER_KEY);
Parse.serverURL = config.PARSE_URL;

const setUserInfo = (userId) => {
	let User = Parse.Object.extend('User');
	let user = new User();
	user.set(config.FB_TOKEN, userId);

	return new Promise(function(resolve, reject){
		user.save()
			.then(function(user){
				console.log('User Saved: ' + user);
				resolve(user);
			})
			.catch(function(error){
				console.log('Error Saving User: ' + error);
				reject(error.description);
			});
	});
};

module.exports = {
	// add methods
	setUserInfo
};
