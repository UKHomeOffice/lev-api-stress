'use strict';

const index = require('rewire')('../src');
const appendObject = index.__get__('appendObject');
const aggregate = index.__get__('aggregate');
const appendIntermediates = index.__get__('appendIntermediates');
const readFiles = index.__get__('readFiles');
const mergeResults = index.__get__('mergeResults');
const parseContents = index.__get__('parseContents');
const aggregateJSON = index.__get__('aggregateJSON');
let readFileSyncStub = sinon.stub();
let writeFileSyncStub = sinon.stub();
index.__set__('fs', { readFileSync: readFileSyncStub, writeFileSync: writeFileSyncStub });

const aggregate1 = { aggregate: {
  timestamp: '2020-01-05T10:33:45.888Z',
  scenariosCreated: 5000,
  scenariosCompleted: 5000,
  requestsCompleted: 500,
  latency: { min: 19.6, max: 1931.2, median: 100.5, p95: 276.4, p99: 938.5 },
  rps: { count: 1000, mean: 45.0 },
  scenarioDuration: { min: 75.7, max: 3045.6, median: 1103.5, p95: 1293.8, p99: 3889.2 },
  scenarioCounts: { 'Name/DoB search': 5000, 'System number search': 2000 },
  errors: { ENOTFOUND: 3, EAI_AGAIN: 5 },
  codes: { 200: 30000 },
  matches: 0,
  customStats: 0,
  counters: 0,
  scenariosAvoided: 0,
  phases: [{
    duration: 600,
    arrivalRate: 10,
    rampTo: 50
  }] }, intermediate: [{
    timestamp: '2020-01-05T10:33:45.888Z',
    scenariosCreated: 5000,
    scenariosCompleted: 5000,
    requestsCompleted: 500,
    latency: { min: 19.6, max: 1931.2, median: 100.5, p95: 276.4, p99: 938.5 },
    rps: { count: 1000, mean: 45.0 },
    scenarioDuration: { min: 75.7, max: 3045.6, median: 1103.5, p95: 1293.8, p99: 3889.2 },
    scenarioCounts: { 'Name/DoB search': 5000, 'System number search': 2000 },
    errors: { ENOTFOUND: 3, EAI_AGAIN: 5 },
    codes: { 200: 30000 },
    matches: 0,
    customStats: 0,
    counters: 0,
    scenariosAvoided: 0,
    phases: [{
      duration: 600,
      arrivalRate: 10,
      rampTo: 50
    }] }]
};
const aggregate2 = { aggregate: {
    timestamp: '2021-01-05T10:33:45.888Z',
    scenariosCreated: 10000,
    scenariosCompleted: 3000,
    requestsCompleted: 350,
    latency: { min: 21.6, max: 2011.2, median: 150.5, p95: 3293.8, p99: 3889.2 },
    rps: { count: 2000, mean: 35.2 },
    scenarioDuration: { min: 68.7, max: 5045.6, median: 3103.5, p95: 3293.8, p99: 1223.3 },
    scenarioCounts: { 'Name/DoB search': 3000, 'System number search': 1000 },
    errors: { ECONNRESET: 2 },
    codes: { 200: 1, 201: 10000 },
    matches: 0,
    customStats: {},
    counters: {},
    scenariosAvoided: 0,
    phases: [{
      duration: 600,
      arrivalRate: 10,
      rampTo: 50
    }]
  }, intermediate: [{
    timestamp: '2021-01-05T10:33:45.888Z',
    scenariosCreated: 10000,
    scenariosCompleted: 3000,
    requestsCompleted: 350,
    latency: { min: 21.6, max: 2011.2, median: 150.5, p95: 3293.8, p99: 3889.2 },
    rps: { count: 2000, mean: 35.2 },
    scenarioDuration: { min: 68.7, max: 5045.6, median: 3103.5, p95: 3293.8, p99: 1223.3 },
    scenarioCounts: { 'Name/DoB search': 3000, 'System number search': 1000 },
    errors: { ECONNRESET: 2 },
    codes: { 200: 1, 201: 10000 },
    matches: 0,
    customStats: {},
    counters: {},
    scenariosAvoided: 0,
    phases: [{
      duration: 600,
      arrivalRate: 10,
      rampTo: 50
    }]
  }]
};

const aggregate3 = {
    timestamp: ['2021-01-05T10:33:45.888Z', '2020-01-05T10:33:45.888Z'],
    scenariosCreated: 15000,
    scenariosCompleted: 8000,
    requestsCompleted: 850,
    latency: { min: 19.6, max: 2011.2, median: 1015.4, p95: 3293.8, p99: 3889.2 },
    rps: { count: 3000, mean: 40.1 },
    scenarioDuration: { min: 68.7, max: 5045.6, median: 2557.15, p95: 3293.8, p99: 3889.2 },
    scenarioCounts: { 'Name/DoB search': 8000, 'System number search': 3000 },
    errors: { ENOTFOUND: 3, EAI_AGAIN: 5, ECONNRESET: 2 },
    codes: { 200: 30001, 201: 10000 },
    matches: 0,
    customStats: {},
    counters: {},
    scenariosAvoided: 0,
    phases: [{
      duration: 600,
      arrivalRate: 10,
      rampTo: 50
    }]
};

describe('aggregate results', () => {
  describe('parseContents function', () => {
    it('should take some input', () => {
      expect(parseContents)
        .to.be.an('function')
        .to.have.property('length', 1);
    });

    describe('input parameter', () => {
      it('should throw an error when input is not an array', () => {
        expect(() => parseContents(1))
          .to.throw(TypeError, 'Expected an array of strings');
      });
      it('should throw an error when input has fewer than 2 elements', () => {
        expect(() => parseContents(['element1']))
          .to.throw(RangeError, 'Expected an array of 2 or more elements');
      });
      it('should throw an error when input is not an array of strings', () => {
        expect(() => parseContents([null, {}]))
          .to.throw(TypeError, 'Expected an array of strings');
      });
      it('should throw an error when input strings are not valid json', () => {
        expect(() => parseContents(['not valid', 'json strings']))
          .to.throw(SyntaxError, 'Expected an array of JSON formatted strings');
      });
      it('should return a result array of objects', () => {
        expect(parseContents(['{"test": "test"}', '{}']))
          .to.be.an('array')
          .that.deep.equals([{ test: 'test' }, {}]);
      });
    });
  });

  describe('readFiles function', () => {
    it('should some input', () => {
      expect(readFiles)
        .to.be.an('function')
        .to.have.property('length', 1);
    });
    before('mock out "fs"', () => {
      readFileSyncStub.withArgs('./nonexistent-file').throws();
      readFileSyncStub.withArgs('./file1').returns('file contents 1');
      readFileSyncStub.withArgs('./file2').returns('file contents 2');
    });
    describe('should throw an error when', () => {
      it('the input file paths does not exist', () => {
        expect(() => readFiles(['./nonexistent-file', './nonexistent-file']))
          .to.throw(Error, 'File not found');
      });
    });

    it('should read the files and return an array of their contents strings', () => {
      expect(readFiles(['./file1', './file2']))
        .to.be.an('array')
        .that.deep.equals(['file contents 1', 'file contents 2']);
    });
  });

  describe('append intermediates function', () => {
    const intermediate1 = { intermediate: [{ timestamp: '2020-02-05T10:33:45.888Z' }] };
    const intermediate2 = { intermediate: [{ timestamp: '2020-01-05T10:33:45.888Z' }] };
    const intermediate3 = { intermediate: [{ timestamp: '2021-01-05T10:33:45.888Z' }] };

    it('should take a collection of arrays and return a single sorted array by timestamp - oldest first', () => {
      expect(appendIntermediates([intermediate1, intermediate2, intermediate3]))
        .to.deep.equal([{ timestamp: '2020-01-05T10:33:45.888Z' }, { timestamp: '2020-02-05T10:33:45.888Z' },
        { timestamp: '2021-01-05T10:33:45.888Z' }]);
    });
  });

  describe('aggregate function', () => {
    it('should return an aggregate object', () => {
      expect(aggregate([]))
        .to.be.an('object')
        .with.keys(['timestamp', 'scenariosCreated', 'scenariosCompleted',
        'requestsCompleted', 'latency', 'rps', 'scenarioDuration', 'scenarioCounts',
          'errors', 'codes', 'matches', 'customStats', 'counters',
        'scenariosAvoided', 'phases'
        ]);
    });
    it('should take an aggregate as an input and return updated aggregated object ', () => {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('scenariosCompleted', 8000);
    });
    it('should take an aggregate as an input and return updated aggregated object ', () => {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('scenariosCreated', 15000);
    });
    it('should take an aggregate as an input and return updated aggregated object ', () => {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('requestsCompleted', 850);
    });
    it('should take an aggregate as an input and return updated aggregated object ', () => {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('timestamp', ['2021-01-05T10:33:45.888Z', '2020-01-05T10:33:45.888Z']);
    });
    it('should take an aggregate as an input and return updated aggregated object ', () => {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('errors', { 'ENOTFOUND': 3, 'EAI_AGAIN': 5, 'ECONNRESET': 2 });
    });
    it('should return an aggregated object of HTTP status codes from multiple input aggregates', ()=> {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('codes', { '200': 30001, '201': 10000 });
    });
    it('should take an aggregate as an input and return updated aggregated object', ()=> {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('scenarioCounts', { 'Name/DoB search': 8000, 'System number search': 3000 });
    });
    it('should return an aggregate count and calculated mean', ()=> {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('rps', { count: 3000, mean: 40.1 });
    });
    it('should return an aggregated latency object', ()=> {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('latency',
        { min: 19.6, max: 2011.2, median: 1015.4, p95: 3293.8, p99: 3889.2 });
    });
    it('should return an aggregated scenarioDuration object', ()=> {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('scenarioDuration',
        { min: 68.7, max: 5045.6, median: 2557.15, p95: 3293.8, p99: 3889.2 });
    });
    it('should return an aggregated phases object', ()=> {
      expect(aggregate([aggregate1, aggregate2]))
        .to.have.deep.property('phases', [
        { duration: 600, arrivalRate: 10, rampTo: 50 }
      ]);
    });

    it('should return an updated aggregated object from multiple input aggregates', ()=> {
        expect(aggregate([aggregate1, aggregate2]))
          .to.deep.equal(aggregate3);
    });
  });

  // as function is nested in reduce, it is called for each object passed as a value, hence why function repeated
  describe('appendObject function', () => {
    it('should take no input and return an empty object', () => {
      expect(appendObject({}, {}))
        .to.deep.equal({});
    });
    it('should take 2 objects and combine them by summing properties', () => {
      expect(appendObject({}, { 200: 50, 201: 50 }))
        .to.deep.equal({ 200: 50, 201: 50 });
      expect(appendObject({ 200: 50, 201: 50 }, { 200: 60 }))
        .to.deep.equal({ 200: 110, 201: 50 });
    });
  });

  describe('aggregate JSON', () => {
    it('objects as input and returns a JSON string', () => {
      expect(aggregateJSON([aggregate1, aggregate2]))
        .to.be.a('string');
    });
    it('should return a JSON string with an aggregate object and intermediate array', () => {
      expect(aggregateJSON([aggregate1, aggregate2]))
        .to.deep.equal(JSON.stringify(
          { aggregate: aggregate3, intermediate: [aggregate1.aggregate, aggregate2.aggregate] }, null, 1));
    });
  });

  before('mock out "fs"', () => {
    writeFileSyncStub.withArgs('./output/test.json', 'some data').throws(new Error('File does not exist'));
  });
});
  describe('merge results function', () => {
    it('should thrown an error when no input', () => {
      expect(() => mergeResults())
        .to.throw(Error, 'Argument must contain 2 or more files');
    });
    it('should throw an error when input is a single file', () => {
      expect(() => mergeResults('a'))
        .to.throw(Error, 'Argument must contain 2 or more files');
    });
    it('should throw an error when a file not found', () => {
      expect(() => mergeResults('./output/test.json', 'some data'))
        .to.throw(Error, 'File not found');
    });
  /*
aggregate = {
  timestamp: '2020-02-05T10:42:39.927Z',  // ^ Newest/last to finish
  scenariosCreated: 16323,                // + // => [].reduce((t, i) => t += i, 0)
  scenariosCompleted: 16323,              // +
  requestsCompleted: 24546,               // +
  latency: { min: 19.6, max: 2011.2, median: 87.5, p95: 276.4, p99: 938.5 }, // ??? v, ^, v+^/2, ^, ^
  rps: { count: 24546, mean: 45.13 },     // + , +/N
  scenarioDuration: { min: 68.7, max: 5045.6, median: 3103.5, p95: 3293.8, p99: 3889.2 }, // ???
  scenarioCounts: { 'Name/DoB search': 8223, 'System number search': 8100 }, // + , +
  errors: {},                             // { +, +, ...}
  codes: { '200': 24546 },                // { +, +, ...}
  matches: 0,                             // 1
  customStats: {},                        // 1
  counters: {},                           // 1
  scenariosAvoided: 0,                    // 1
  phases: [ { duration: 540, arrivalRate: 10, rampTo: 50 } ] // 1 ... [ { d, a*N, r*N } ]
}
 */

    // e(f(g(h(?)))) :: > ./src/index.js ./output/result-*.json :: >
    // ./src/index.js ./output/result-1.json ./output/result-2.json ...
    // h(?) : take A LIST OF fileS (as paths) return array of string contents
    // g(?) : take array of strings return array of objects
    // f(?) : take array of objects
    //      + look for "intermediate" and "aggregate"
    // f.1     + append and sort (by timestamp newest first) intermediates into a single array
    // f.2     + aggregate aggregates into a single aggregate
    //      + return aggregated object - comprising the aggregated "intermediate" and "aggregate" fields
    // e(?) : writes object data to file
});
