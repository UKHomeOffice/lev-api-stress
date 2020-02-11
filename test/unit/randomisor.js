'use strict';

const randomisor = require('rewire')('../../src/randomisor');
const randomSystemNumber = randomisor.__get__('randomSystemNumber');

const when = { Math: { random: { returns: r => randomisor.__with__({ Math: {
		random: () => r,
		round: Math.round
	} })
} } };

describe('randomisor helper function', () => {
	describe('randomSystemNumber', () => {
		it('should pick a random number', () =>
			expect(randomSystemNumber())
				.to.be.an.integer()
				.that.is.not.equal(randomSystemNumber()));

		describe('always picks a number that', () => {
			it('should be higher than 500 million', () =>
				when.Math.random.returns(0)(() =>
				expect(randomSystemNumber())
				.to.be.at.least(500000000)));
		});

		describe('always picks a number which', () => {
			it('should be lower than 530 million', () =>
				when.Math.random.returns(1)(() =>
				expect(randomSystemNumber())
				.to.be.at.most(530000000)));
		});
	});
});
