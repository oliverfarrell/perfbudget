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
var defaultOptions = require('./config/defaults'),
    _ = require('lodash'),
    testId, curStatus;

var runTest = function(options, callback) {
  options = _.merge( defaultOptions, options );

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
    callback(new Error('Empty budget option provided'));
  }


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
            str += item + ': ' + median[item] + ' [FAIL]\n';
            str += 'Budget is ' + budget[item] + '\n\n';
          } else {
            str += item + ': ' + median[item] + ' [PASS]\n';
            str += 'Budget is ' + budget[item] + '\n\n';
          }
        }
      }
    }

    // save the file before failing or passing
    // stefan: this is a bit weird or?
    var output = options.output;
    if (typeof output !== 'undefined') {
      console.log('Writing file: ' + output);
      console.log(output, JSON.stringify(data));
    }

    callback(null, {
      data : data,
      msg : str,
      options : options,
      pass : pass,
      summary : summary
    });
  };

  var retrieveResults = function(response) {
    if (response.statusCode === 200) {
      // yay! Let's process it now
      processData(response.data);
    } else {
      if (response.statusCode !== curStatus) {
        callback(new Error(response.statusText));
      }
    }
  };


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
          status = 'Test ' + err.error.testId + ' has timed out. You can still view the results online at ' +
                  options.wptInstance + '/results.php?test=' + err.error.testId + '.';
        } else {
          // we'll keep this just in case
          status = 'Test ' + err.error.testId + ' has errored. Error code: ' + err.error.code + '.';
        }
      } else {
        status = err.statusText || (err.code + ' ' + err.message);
      }

      callback(new Error(status));
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
      callback(new Error(data.statusText));
    }
  });
}

module.exports = {
  runTest : runTest
};
