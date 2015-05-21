#! /usr/bin/env node

/*
 * perfbudget
 * https://github.com/oliverfarrell/perfbudget
 *
 * Licensed under the MIT license.
 */

'use strict';

/**
 * Module dependencies
 */
var colors = require('colors'),
    argv = require('minimist')(process.argv.slice(2)),
    testId, curStatus;

// setup some useful defaults
var options = {
  url: '',
  key: '',
  location: "Dulles:Chrome",
  wptInstance: "www.webpagetest.org",
  connectivity: '',
  bandwidthDown: '',
  bandwidthUp: '',
  latency: '',
  packetLossRate: '',
  login: '',
  password: '',
  authenticationType: '',
  video: 1,
  runs: 1,
  pollResults: 5,
  timeout: 60,
  repeatView: false,
  budget: {
    visualComplete: '',
    render: '1000',
    loadTime: '',
    docTime: '',
    fullyLoaded: '',
    bytesIn: '',
    bytesInDoc: '',
    requests: '',
    requestsDoc: '',
    SpeedIndex: '1000'
  }
};

/**
 * Override the defaults
 */

// url
if(argv.url) options.url = argv.url;

// api key
if(argv.key) options.key = argv.key;

// location
if(argv.location) options.location = argv.location;

// visual complete
if(argv.visualComplete) options.budget.render = argv.visualComplete;

// load time
if(argv.loadTime) options.budget.loadTime = argv.loadTime;

// doc time
if(argv.docTime) options.budget.docTime = argv.docTime;

// full loaded
if(argv.fullyLoaded) options.budget.fullyLoaded = argv.fullyLoaded;

// bytes in
if(argv.bytesIn) options.budget.bytesIn = argv.bytesIn;

// bytes in doc
if(argv.bytesInDoc) options.budget.bytesInDoc = argv.bytesInDoc;

// requests
if(argv.requests) options.budget.requests = argv.requests;

// requests doc
if(argv.requestsDoc) options.budget.requestsDoc = argv.requestsDoc;

// speed index
if(argv.SpeedIndex) options.budget.SpeedIndex = argv.SpeedIndex;

/**
 * Takes the data returned by wpt.getTestResults and compares
 * to our budget thresholds
 */
var processData = function(data) {

  var budget = options.budget,
      summary = data.summary,
      median = options.repeatView ? data.median.repeatView : data.median.firstView,
      pass = true,
      str = "";

  for (var item in budget) {
    // make sure this is objects own property and not inherited
    if (budget.hasOwnProperty(item)) {
      // make sure it exists
      if (budget[item] !== '' && median.hasOwnProperty(item)) {
        if (median[item] > budget[item]) {
          pass = false;
          str += item + ': ' + median[item] + ' ' + colors.red('[FAIL]') + '\n';
          str += 'Budget is ' + budget[item] + '\n\n';
        } else {
          str += item + ': ' + median[item] + ' ' + colors.green('[PASS]') + '\n';
          str += 'Budget is ' + budget[item] + '\n\n';
        }
      }
    }
  }

  // save the file before failing or passing
  var output = options.output;
  if (typeof output !== 'undefined') {
    console.log('Writing file: ' + output);
    console.log(output, JSON.stringify(data));
  }

  // output our header and results
  if (!pass) {
    console.log(
      '\n-----------------------------------------------' +
      '\nTest for ' + options.url + ' \t ' + colors.red('[FAILED]') +
      '\n-----------------------------------------------\n'
    );
    console.log(str);
    console.log('Summary: ' + summary);
  } else {
    console.log(
      '\n-----------------------------------------------' +
      '\nTest for ' + options.url + ' \t ' + colors.green('PASSED') +
      '\n-----------------------------------------------\n'
    );
    console.log(str);
    console.log('Summary: ' + summary);
  }
};

var retrieveResults = function(response) {
  if (response.statusCode === 200) {
    // yay! Let's process it now
    processData(response.data);
  } else {
    if (response.statusCode !== curStatus) {
      // we had a problem
      console.log(colors.red(response.statusText));
    }
  }
};

var WebPageTest = require('webpagetest'),
    wpt = new WebPageTest(options.wptInstance, options.key),
    reserved = ['key', 'url', 'budget', 'wptInstance'],
    err, data, toSend = {};

for (var item in options) {
  if (reserved.indexOf(item) === -1 && options[item] !== '') {
    toSend[item] = options[item];
  }
}

if (options.repeatView) {
  // if repeatView, we need to get repeat
  toSend['firstViewOnly'] = false;
} else {
  // otherwise, don't
  toSend['firstViewOnly'] = true;
}

if (Object.keys(options.budget).length === 0) {
  // empty budget defined, so error
  console.log('Empty budget option provided');
}

// run the test
wpt.runTest(options.url, toSend, function(err, data) {
  if (err) {
    // ruh roh!
    var status;
    if (err.error) {
      // underlying API throws errors inconsistently
      // so we need to do this check

      // custom for timeout because that could be common
      if (err.error.code === 'TIMEOUT') {
        status = colors.red('Test ' + err.error.testId + ' has timed out. You can still view the results online at ' +
                options.wptInstance + '/results.php?test=' + err.error.testId + '.');
      } else {
        // we'll keep this just in case
        status = 'Test ' + err.error.testId + ' has errored. Error code: ' + err.error.code + '.';
      }
    } else {
      status = err.statusText || (err.code + ' ' + err.message);
    }

    console.log(status);
  } else if (data.statusCode === 200) {
    testId = data.id;

    if (data.successfulFVRuns <= 0) {
      console.log('Test ' + testId + ' was unable to complete. Please see ' + data.summary + ' for more details.');
    } else {
      // yay! now try to get the actual results
      retrieveResults(data);
    }

  } else {
    // ruh roh! Something is off here.
    console.log(data.statusText);
  }
});
