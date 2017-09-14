const config = require('../config');
const helpers = require('../helpers/helper');
const fbMessageType = require('../managers/fbMessageTypesManager');

const getAccountSummary = (userId, delay) => {
	// fetch Current Account Plan, Sites Count and return in messages

	if (helpers.isDefined(delay) && delay > 0.0) {
		setTimeout(function(){
			// send message with delay
		}, delay);
	} else {
		// send message without delay
	}
};

const changePlanMenu = (userId, delay) => {
	// return current Plan
	// present options for change as quick replies

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

const getBandwidthUsage = (userId, timePeriod, startDate, endDate, delay) => {
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
	getAccountSummary,
	changePlanMenu,
	bandwidthUsageMenu,
	getBandwidthUsage
};
