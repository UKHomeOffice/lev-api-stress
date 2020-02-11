'use strict';

const randomSystemNumber = () => 500000000 + Math.round(Math.random() * 30000000);

module.exports = {
	getSystemNumber: (userContext, events, done) => {
		userContext.vars.systemNumber = randomSystemNumber();
		return done();
	}
};
