const _ = require('lodash');
const helpers = require('../helpers/helper');
const dataStore = require('../services/dataStoreService');
const fbMessageType = require('../managers/fbMessageTypesManager');
const fbProfile = require('../services/fbProfileService');
const forge = require('../services/forgeService');
const onboarding = require('../stories/onboarding');
const menu = require('../stories/menu');
const siteMenu = require('../stories/siteMenu');

const handleApiAiAction = (sender, action, responseText, contexts, parameters) => {
	switch (action) {
		case 'site-settings-options': {
			if (helpers.isDefined(contexts[0]) && contexts[0].name == 'site-settings') {
				siteMenu.siteSettingsMenu(sender);
			}
			break;
		}
	case 'show-main-menu': {
		menu.showMainMenu(sender);
		break;
	}
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
					fbMessageType.sendTypingOn(sender);
					fbMessageType.sendTextMessage(sender, 'Now, one second while I analyse your Forge account', 2000);
					fbMessageType.sendTypingOn(sender);
					let sites = response.data['site_tokens'];
					let siteKeys = Object.keys(sites);
					const siteCountMessage = 'You currently have ' + siteKeys.length +  ' sites in Forge';
					fbMessageType.sendTextMessage(sender, siteCountMessage, 4000);

					let chunkedArray = _.chunk(siteKeys, 10);
					console.log('chunkedArray: ' + chunkedArray);
					let chunks = chunkedArray.length;
					console.log('Chunks: ' + chunks);
					let counter = 5000;
					for (let i = 0; i < chunks; i++) {
						fbMessageType.sendTypingOn(sender);
						const siteListMessage = chunkedArray[i].toString();
						fbMessageType.sendTextMessage(sender, siteListMessage, counter);
						counter + 1000;
					}
					fbMessageType.sendTypingOn(sender);
					menu.showMainMenu(sender, counter + 1500);
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
