'use strict';

const http = require('http');
const nrc = require('node-run-cmd');

const duration = 2;
const rate = 50;
const log = console.log;
const sysnums = [];

describe('randomisor', () => {
	before('setup a simple server', done => {
		this.server = http.createServer((req, res) => sysnums.push(req.url) && res.end('OK'));
		this.server.listen(3000, done);
	});
	describe('when declared in artillery config', () => {
		before('run a simple artillery test', function(done) {
			this.timeout(5000 + (duration * 1000));
			nrc.run('artillery run ./test/integration/artillery-config.yml', {
				env: { PATH: process.env.PATH, ART_DURATION: duration, ART_RATE: rate },
				onError: log,
				// onData: log, // uncomment to debug, i.e. show artillery output
				onDone: code => expect(code).to.equal(0) && done()
			});
		});
		it('should have sent a bunch of requests to the dummy server', () =>
			expect(sysnums)
				.to.be.an('array')
				.that.has.lengthOf(duration * rate));
		describe('the requests', () => {
			it('should match the url pattern', () =>
				expect(sysnums)
					.each.to.match(/^\/randsysnum=\d{9}$/));
			it('should have a number in the expected range', () =>
				expect(sysnums.map(s => parseInt(s.substr(-9), 10)))
					.each.to.be.at.least(500000000)
					.and.to.be.at.most(530000000));
		});
	});
	after('shutdown server', done => {
		this.server.close(done);
	});
});
