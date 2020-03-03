'use strict';

const randomisor = require('rewire')('../../src/randomisor');
const randomSystemNumber = randomisor.__get__('randomSystemNumber');
const randomFirstNames = randomisor.__get__('randomFirstNames');
const weightedRandom = randomisor.__get__('weightedRandom');
const randomDoB = randomisor.__get__('randomDoB');
const pickFrom = randomisor.__get__('pickFrom');

const when = { Math: { random: { returns: r => randomisor.__with__({ Math: {
		random: () => r,
		round: Math.round,
		floor: Math.floor
	} })
} } };

describe('randomisor helper function', () => {
	describe('randomSystemNumber', () => {
		it('should pick a random number', () =>
			expect(randomSystemNumber())
				.to.be.an.integer()
				.that.is.not.equal(randomSystemNumber()));
		it('should be at least 500 million', () =>
			when.Math.random.returns(0)(() =>
			expect(randomSystemNumber())
			.to.be.at.least(500000000)));
		it('should be at most 530 million', () =>
			when.Math.random.returns(1)(() =>
			expect(randomSystemNumber())
			.to.be.at.most(530000000)));
	});

	describe('pickFrom', () => {
		const list = Array.from({ length: 100000 }, (_, i) => i);
		it('should take an input list', () => expect(pickFrom).to.have.lengthOf(1));
		it('should pick a random item from the input list', () =>
			expect(pickFrom(list))
				.to.be.a('number')
				.that.does.not.equal(pickFrom(list))
		);
		it('should select from the start of the list', () =>
			when.Math.random.returns(0)(() =>
			expect(pickFrom(list))
			.to.equal(list[0])));
		it('should select upto the end of the list', () =>
			when.Math.random.returns(0.9999999999)(() =>
			expect(pickFrom(list))
			.to.equal(list[list.length - 1])));
	});

	describe('weightedRandom', () => {
		it('should pick a number', () => expect(weightedRandom()).to.be.a('number'));
		it('should always return a number', () =>
			when.Math.random.returns(1)(() =>
			expect(weightedRandom())
			.to.equal(5)));
		describe('spread', function() {
			before('repeatedly call the function', () => {
				this.spread = Object.entries(
					Array.from({ length: randomisor.__get__('weightingTotal') * 1000 }, () => weightedRandom())
						.reduce((w, n) => ({ ...w, [n]: (w[n] || 0) + 1 }), {})
				).map(e => [parseInt(e[0], 10), Math.round(e[1] / 1000.0)]);
			});
			it('should match the defined weights', () =>
				expect(this.spread)
					.to.be.an('array')
					.that.deep.equals(randomisor.__get__('forenameCountWeighting')));
		});
	});

	describe('randomFirstNames', () => {
		it('should return a string', () => expect(randomFirstNames()).to.be.a('string'));
		it('should always return space separated names', () =>
			expect(Array.from({ length: 100 }, () => randomFirstNames()))
				.to.each.match(/^[\w ]+$/));
	});

	describe('randomDoB', () => {
		it('should return a date', () => expect(randomDoB()).to.be.a('string').that.matches(/^\d{4}-\d\d-\d\d$/));
		it('should be at least 500 million', () =>
			when.Math.random.returns(0)(() =>
			expect(randomDoB())
			.to.equal('2009-07-31')));
		it('should be at most 530 million', () =>
			when.Math.random.returns(1)(() =>
			expect(new Date().toISOString())
			.to.have.string(randomDoB())));
	});
});
