'use strict';

global.chai = require('chai')
	.use(require('sinon-chai'))
	.use(require('chai-fs'))
	.use(require('chai-json'))
	.use(require('chai-each'))
	.use(require('chai-integer'));
global.expect = chai.expect;
global.sinon = require('sinon');
