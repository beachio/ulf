var Parse = require('parse/node');
var config = require('../config');
var helpers = require('../helpers/helper');

Parse.initialize(config.PARSE_APP_ID, config.PARSE_JAVASCRIPT_KEY);
Parse.serverURL = config.PARSE_URL;

const setUserInfo = (userId) => {
	let Person = Parse.Object.extend('Person');
	let user = new Person();
	user.set('fbId', userId);
	return new Promise(function(resolve, reject){
		user.save()
			.then(function(user){
				console.log('User Saved: ' + user);
				resolve(user);
			})
			.catch(function(error){
				console.log('Error Saving User: ' + error);
				reject(error);
			});
	});
};

module.exports = {
	// add methods
	setUserInfo
};
