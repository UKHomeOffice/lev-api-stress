'use strict';

const http = require('http');
const nrc = require('node-run-cmd');

const duration = 2;
const rate = 50;
const log = console.log;
let urls = [];

describe('randomisor', () => {
	before('setup a simple server', done => {
		this.server = http.createServer((req, res) => urls.push(req.url) && res.end('OK'));
		this.server.listen(3000, done);
	});

	describe('when used in artillery config', () => {
		describe('getSystemNumber', () => {
			before('run a simple artillery test', function(done) {
				this.timeout(6000 + (duration * 1000));
				nrc.run('artillery run ./test/integration/fixtures/system-number-config.yml', {
					env: { PATH: process.env.PATH, ART_DURATION: duration, ART_RATE: rate },
					onError: log,
					// onData: log, // uncomment to debug, i.e. show artillery output
					onDone: code => expect(code).to.equal(0) && done()
				});
			});
			it('should have sent a bunch of requests to the dummy server', () =>
				expect(urls)
					.to.be.an('array')
					.that.has.lengthOf(duration * rate));
			describe('the requests', () => {
				it('should match the url pattern', () =>
					expect(urls)
						.each.to.match(/^\/randsysnum=\d{9}$/));
				it('should have a number in the expected range', () =>
					expect(urls.map(s => parseInt(s.substr(-9), 10)))
						.each.to.be.at.least(500000000)
						.and.to.be.at.most(530000000));
			});
		});

		describe('getSearchTerms', () => {
			const start = new Date('2009-07-01');
			const end = new Date(Date.now());
			const regex = /^\/randsurname=\w+&randfirstnames=(?:\w+)(?:%20\w+)*&randdob=\d{4}-\d\d-\d\d$/;
			before('run a simple artillery test', function(done) {
				urls = [];
				this.timeout(6000 + (duration * 1000));
				nrc.run('artillery run ./test/integration/fixtures/search-terms-config.yml', {
					env: { PATH: process.env.PATH, ART_DURATION: duration, ART_RATE: rate },
					onError: log,
					// onData: log, // uncomment to debug, i.e. show artillery output
					onDone: code => expect(code).to.equal(0) && done()
				});
			});
			it('should have sent a bunch of requests to the dummy server', () =>
				expect(urls)
					.to.be.an('array')
					.that.has.lengthOf(duration * rate));
			describe('the requests', () => {
				it('should match the url pattern', () =>
					expect(urls)
						.to.each.match(regex));
				it('should have a number in the expected range', () =>
					expect(urls.map(s => new Date(s.substr(-10))))
						.to.each.be.within(start, end));
			});
		});
	});

	after('shutdown server', done => {
		this.server.close(done);
	});
});
