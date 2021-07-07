'use strict';

let fs = require('fs');

const appendObject = (target, source) => {
  if (source) {
    Object.entries(source).forEach(([fld, val]) => {
      target[fld] = val + (target[fld] || 0);
    });
  }
  return target;
};

const objectMerge = (target, source) => {
  if (source) {
    target = {
      min: target.min < source.min ? target.min : source.min,
      max: target.max > source.max ? target.max : source.max,
      median: target.min + target.max,
      p95: target.p95 > source.p95 ? target.p95 : source.p95,
      p99: target.p99 > source.p99 ? target.p99 : source.p99,
    };
    target.median = target.min + target.max;
  }
  return target;
};

const aggregate = (aggregates) => {
  let intermediateAggregate = (aggregates.map(r => r.aggregate).reduce((acc, cur) => (
      {
        timestamp: acc.timestamp.concat(cur.timestamp).sort().reverse(),
        scenariosCreated: acc.scenariosCreated + cur.scenariosCreated,
        scenariosCompleted: acc.scenariosCompleted + cur.scenariosCompleted,
        requestsCompleted: acc.requestsCompleted + cur.requestsCompleted,
        latency: objectMerge(acc.latency, cur.latency),
        rps: appendObject(acc.rps, cur.rps),
        scenarioDuration: objectMerge(acc.scenarioDuration, cur.scenarioDuration),
        scenarioCounts: appendObject(acc.scenarioCounts, cur.scenarioCounts),
        errors: appendObject(acc.errors, cur.errors),
        codes: appendObject(acc.codes, cur.codes),
        matches: cur.matches,
        customStats: cur.customStats,
        counters: cur.counters,
        scenariosAvoided: cur.scenariosAvoided,
        phases: cur.phases,
      }), {
    timestamp: [],
    scenariosCreated: 0,
    scenariosCompleted: 0,
    requestsCompleted: 0,
    latency: {},
    rps: {},
    scenarioDuration: {},
    scenarioCounts: {},
    errors: {},
    codes: {},
    matches: 0,
    customStats: {},
    counters: {},
    scenariosAvoided: 0,
    phases: []
  }));
  intermediateAggregate.rps.mean /= aggregates.length;
  intermediateAggregate.latency.median /= aggregates.length;
  intermediateAggregate.scenarioDuration.median /= aggregates.length;
  return intermediateAggregate;
};

const appendIntermediates = results => {
  return results.map(res => res.intermediate).flat(Infinity).sort((item1, item2) => {
    return item1.timestamp.localeCompare(item2.timestamp);
  });
};

const readFiles = files => {
  try {
    return files.map(item => fs.readFileSync(item, 'utf8'));
  } catch (e) {
    throw new Error('File not found');
  }
};

const parseContents = jsonResults => {
  if (!Array.isArray(jsonResults)) {
    throw new TypeError('Expected an array of strings');
  }
  if (jsonResults.length < 2) {
    throw new RangeError('Expected an array of 2 or more elements');
  }
  return jsonResults.map((item) => {
    if (typeof item !== 'string') {
      throw new TypeError('Expected an array of strings');
    }
    try {
      return JSON.parse(item);
    } catch (e) {
      throw new SyntaxError('Expected an array of JSON formatted strings');
    }
  });
};

const aggregateJSON = jsonResults => {
  let result = { aggregate: aggregate(jsonResults),
    intermediate: appendIntermediates(jsonResults)
  };
  return JSON.stringify(result, null, 1);
};

const mergeResults = results => {
  if (!results || results.length < 2) {
    throw new Error('Argument must contain 2 or more files');
  }
  const aggJSON = aggregateJSON(parseContents(readFiles(results)));
  try {
    fs.writeFileSync('./output/aggregated-stress-test-results.json', aggJSON);
  } catch (e) {
    throw new Error(`usage: ${process.argv0} result-file.json result-file2.json [...]`);
  }
};

module.exports = { mergeResults };
