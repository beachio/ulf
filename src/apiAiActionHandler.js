const helpers = require('../helpers/helper');
const dataStore = require('../services/dataStoreService');
const fbMessageType = require('../managers/fbMessageTypesManager');
const fbProfile = require('../services/fbProfileService');
const forge = require('../services/forgeService');
const onboarding = require('../stories/onboarding');

const handleApiAiAction = (sender, action, responseText, contexts, parameters) => {
	switch (action) {
	case 'login-forge': {
		if (helpers.isDefined(contexts[0]) && contexts[0].name == 'login-forge' && contexts[0].parameters) {
			let email = (helpers.isDefined(contexts[0].parameters['email'])
			&& contexts[0].parameters['email'] != '') ? contexts[0].parameters['email'] : '';
			let password = (helpers.isDefined(contexts[0].parameters['password'])
			&& contexts[0].parameters['password'] != '') ? contexts[0].parameters['password'] : '';
			console.log('Email: %s', email);
			console.log('password: %s', password);

			forge.login(email, password)
				.then(function(response){
					fbMessageType.sendTextMessage(sender, 'You have successfully logged in to Forge');
				})
				.catch(function(error){
					fbMessageType.sendTextMessage(sender, 'There was an error logging into your Forge account');
				});
		} else {
			fbMessageType.sendTextMessage(sender, 'Something went wrong');
		}
		break;
	}
	case 'personalised-welcome': {
		onboarding.startOnboarding(sender);
		dataStore.setUserInfo(sender);
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
