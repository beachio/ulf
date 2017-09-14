const config = require('../config');
const helpers = require('../helpers/helper');
const fbMessageType = require('../managers/fbMessageTypesManager');

const getSiteSummary = (userId, site, delay) => {
	// fetch Summary data for the given site

	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const siteSettingsMenu = (userId, delay) => {
	// present options for site settings as quick replies
	let replies = [
		{
			content_type: 'text',
			title: '🎢 SSL',
			payload: 'SET_SSL_MODE'
		},
		{
			content_type: 'text',
			title: '🎫 Force SSL',
			payload: 'SET_FORCE_SSL_MODE'
		},
		{
			content_type: 'text',
			title: '🎫 TurboJS',
			payload: 'SET_TURBOJS_MODE'
		},
		{
			content_type: 'text',
			title: '😹 Hammer Cloud',
			payload: 'SET_HAMMER_CLOUD_MODE'
		},
		{
			content_type: 'text',
			title: '😹 Change Site URL',
			payload: 'SET_SITE_URL'
		}
	];

	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
			fbMessageType.sendQuickReply(userId, 'What would you like to adjust?', replies);
		}, delay);
	} else {
		// send message without delay
		fbMessageType.sendQuickReply(userId, 'What would you like to adjust?', replies);
	}
};

const setSSLMode = (userId, site, status, delay) => {
	//status true = enabled, false = disabled
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const setForceSSLMode = (userId, site, status, delay) => {
	//status true = enabled, false = disabled
	// can only be enabled if SSL mode == true
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const setTurboJSMode = (userId, site, status, delay) => {
	//status true = enabled, false = disabled
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const setHammerMode = (userId, site, status, delay) => {
	//status true = enabled, false = disabled
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const setDomainName = (userId, site, newDomain, delay) => {
	// pass the newDomain param to set the new name for the site
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const setDropboxDeploymentMethod = (userId, site, folderPath, delay) => {
	//deployment_method 'dropbox'
	// folder optional
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const setGithubDeploymentMethod = (userId, site, repositoryName, branchName, delay) => {
	//deployment_method 'github'
	// branch and repo optional
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const setDragDropDeploymentMethod = (userId, site, delay) => {
	//deployment_method 'manually'
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const bandwidthUsageMenu = (userId, delay) => {
	// setup quick replies menu with Day, Week, Month, Year, Range options
	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const getBandwidthUsage = (userId, site, timePeriod, startDate, endDate, delay) => {
	if (helpers.isDefined(timePeriod)) {
		// send request with time period string
	} else if (helpers.isDefined(startDate) && helpers.isDefined(endDate)) {
		// send request with start and end date
	} else {
		// else get default for this month
	}

	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			fbMessageType.sendTextMessage(userId, 'Message that contains some data aout usage for time period with delay');
		}, delay);
	} else {
		fbMessageType.sendTextMessage(userId, 'Message that contains some data aout usage for time period without delay');
	}
};

module.exports = {
	getSiteSummary,
	siteSettingsMenu,
	setSSLMode,
	setForceSSLMode,
	setTurboJSMode,
	setHammerMode,
	setDomainName,
	setDropboxDeploymentMethod,
	setGithubDeploymentMethod,
	setDragDropDeploymentMethod,
	bandwidthUsageMenu,
	getBandwidthUsage
};
