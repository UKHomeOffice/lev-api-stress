'use strict';

const randomSystemNumber = () => 500000000 + Math.round(Math.random() * 30000000);

const uni = ['Alex', 'Carl', 'Colin', 'Daniel', 'Eric', 'Michael', 'Philip', 'Ros'];
const both = ['Clive', 'Craig', 'David', 'Donald', 'Emer', 'Frederick', 'Jon', 'John',
	'Mark', 'Mickel', 'Pearce', 'Robert', 'Roger', 'Tom', 'Will'];
const firstnames = ['Abdul', 'Alice', 'Beth', 'Daisy', 'Derick', 'Emma', 'Grace', 'James', 'Jeremy',
	'Martin', 'Martyn', 'Mohammad', 'Percy', 'Sally', 'Sam', 'Sarah', 'Suzanne', 'Scott', 'Simon', 'Zelda', 'Zoe']
	.concat(both).concat(uni).concat(uni.map(n => n + 'a'));
const surnames = ['Barret', 'Coleridge', 'Davies', 'Frazer', 'Gill', 'Green', 'Jones', 'Knipe',
	'Lesley', 'Martin', 'Riggs', 'Shaw', 'Smith', 'Talbot', 'Taylor', 'Tolkin', 'Waldock', 'Willis', 'Zane']
	.concat(both.concat(uni).map(n => n + 's')).concat(both.concat(uni).map(n => n + 'son'));
const pickFrom = set => set[Math.floor(Math.random() * set.length)];
const forenameCountWeighting = [[1, 50], [2, 25], [3, 12], [4, 6], [5, 3]];
const weightingTotal = forenameCountWeighting.reduce((t, w) => t + w[1], 0);
const weightedRandom = (r = Math.random() * weightingTotal) => forenameCountWeighting.find(w => (r -= w[1]) <= 0)[0];
const randomFirstNames = () => Array.from({ length: weightedRandom() }, () => pickFrom(firstnames)).join(' ');
// midday to stop stupid timezone issues
const start = new Date(2009, 6, 31, 12).getTime();
const range = Date.now() - start;
const randomDoB = () => new Date(start + Math.round(Math.random() * range)).toISOString().substr(0, 10);

module.exports = {
	getSystemNumber: (userContext, events, done) => {
		userContext.vars.systemNumber = randomSystemNumber();
		return done();
	},
	getSearchTerms: (userContext, events, done) => {
		userContext.vars.firstnames = randomFirstNames();
		userContext.vars.surname = pickFrom(surnames);
		userContext.vars.dob = randomDoB();
		return done();
	}
};
