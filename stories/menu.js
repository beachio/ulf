const config = require('../config');
const fbMessageType = require('../managers/fbMessageTypesManager');

const showMainMenu = (userId, delay) => {
	let elements = [
		{
			title: 'Main Menu',
			image_url: config.SERVER_URL + '/assets/main-menu.jpg',
			subtitle: 'Choose an option below',
			buttons: [
				{
					type: 'postback',
					title: 'Account Summary',
					payload: 'ACCOUNT_SUMARY'
				},
				{
					type: 'postback',
					title: 'Change Plan',
					payload: 'ACCOUNT_CHANGE_PLAN'
				},
				{
					type: 'postback',
					title: 'Bandwidth Usage',
					payload: 'ACCOUNT_BANDWIDTH'
				}
			]
		},
		{
			title: 'Site Menu',
			image_url: config.SERVER_URL + '/assets/site-menu.jpg',
			subtitle: 'Choose an option below',
			buttons: [
				{
					type: 'postback',
					title: 'Site Summary',
					payload: 'SITE_SUMARY'
				},
				{
					type: 'postback',
					title: 'Change Settings',
					payload: 'SITE_CHANGE_SETTINGS'
				},
				{
					type: 'postback',
					title: 'Bandwidth Usage',
					payload: 'SITE_BANDWIDTH'
				}
			]
		},
		{
			title: 'Actions Menu',
			image_url: config.SERVER_URL + '/assets/site-actions.jpg',
			subtitle: 'Choose an option below',
			buttons: [
				{
					type: 'postback',
					title: 'Create a Site',
					payload: 'CREATE_SITE'
				},
				{
					type: 'postback',
					title: 'Deploy a Site',
					payload: 'DEPLOY_SITE'
				},
				{
					type: 'postback',
					title: 'Share a Site',
					payload: 'SHARE_SITE'
				}
			]
		}
	];
	if (delay && delay > 0.0) {
		setTimeout(function(){
			fbMessageType.sendGenericMessage(userId, elements);
		}, delay);
	} else {
		fbMessageType.sendGenericMessage(userId, elements);
	}
};

module.exports = {
	showMainMenu
};
