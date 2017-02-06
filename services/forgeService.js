const axios = require('axios');
const config = require('../config');


axios.defaults.baseURL = 'https://getforge.com/api/v2/';
axios.defaults.headers.post['Content-Type'] = 'application/json';

const login = (email, password) => {
	return new Promise(function(resolve, reject){
		axios.post('cli/login?email=' + email + '&password=' + password)
			.then(function(response){
				console.log(response.status);
				console.log(response.data);
				resolve(response);
			})
			.catch(function(error){
				console.log(error);
				reject(error);
			});
	});
};

module.exports = {
	login
};
