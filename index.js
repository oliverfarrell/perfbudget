'use strict';

var options = {
  url: 'http://www.bbc.co.uk',
  key: 'a102fb2a641b4ee182d7ffa2123222a1',
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

var testId,
    curStatus,
    myTimer;

var fs = require('fs');

// takes the data returned by wpt.getTestResults and compares
// to our budget thresholds
var processData = function(data) {

  console.log(data.id);

  fs.writeFile("results.json", JSON.stringify(data, null, 2), function(err) {
    if(err) {
      return console.log(err);
    }

    console.log("The file was saved!");
  }); 

  var budget = options.budget,
      summary = data.summary,
      median = options.repeatView ? data.median.repeatView : data.median.firstView,
      pass = true,
      str = "";

  for (var item in budget) {
    // make sure this is objects own property and not inherited
    if (budget.hasOwnProperty(item)) {
      //make sure it exists
      if (budget[item] !== '' && median.hasOwnProperty(item)) {
        if (median[item] > budget[item]) {
          pass = false;
          str += item + ': ' + median[item] + ' [FAIL]. Budget is ' + budget[item] + '\n';
        } else {
          str += item + ': ' + median[item] + ' [PASS]. Budget is ' + budget[item] + '\n';
        }
      }
    }
  }

  //save the file before failing or passing
  var output = options.output;
  if (typeof output !== 'undefined') {
    console.log('Writing file: ' + output);
    console.log(output, JSON.stringify(data));
    // grunt.log.ok('Writing file: ' + output);
    // grunt.file.write(output, JSON.stringify(data));
  }

  //output our header and results
  if (!pass) {
    // grunt.log.error('\n\n-----------------------------------------------' +
    //       '\nTest for ' + options.url + ' \t  FAILED' +
    //     '\n-----------------------------------------------\n\n');
    // grunt.log.error(str);
    // grunt.log.error('Summary: ' + summary);
    // done(false);
  } else {
    // grunt.log.ok('\n\n-----------------------------------------------' +
    //       '\nTest for ' + options.url + ' \t  PASSED' +
    //     '\n-----------------------------------------------\n\n');
    // grunt.log.ok(str);
    // grunt.log.ok('Summary: ' + summary);
    // done();
  }
};

var retrieveResults = function(response) {
  if (response.statusCode === 200) {
    //yay! Let's process it now
    processData(response);
  } else {
    if (response.statusCode !== curStatus) {
      //we had a problem
      // grunt.log.error( (response.statusText) );
      console.log(response.statusText);
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
      //if repeatView, we need to get repeat
      toSend['firstViewOnly'] = false;
    } else {
      //otherwise, don't
      toSend['firstViewOnly'] = true;
    }

    if (Object.keys(options.budget).length === 0) {
      //empty budget defined, so error
      console.log('Empty budget option provided');
      // grunt.log.error('Empty budget option provided');
      // done(false);
    }

    // run the test
    wpt.runTest(options.url, toSend, function(err, data) {
      console.log('error: ' + err);
      if (err) {
        // ruh roh!
        var status;
        if (err.error) {
          //underlying API throws errors inconsistently
          //so we need to do this check

          //custom for timeout because that could be common
          if (err.error.code === 'TIMEOUT') {
            status = 'Test ' + err.error.testId + ' has timed out. You can still view the results online at ' +
                    options.wptInstance + '/results.php?test=' + err.error.testId + '.';
          } else {
            //we'll keep this just in case
            status = 'Test ' + err.error.testId + ' has errored. Error code: ' + err.error.code + '.';
          }
        } else {
          status = err.statusText || (err.code + ' ' + err.message);
        }

        console.log(status);
      } else if (data.statusCode === 200) {
        testId = data.id;

        if (data.successfulFVRuns <= 0) {
          // grunt.log.error( ('Test ' + testId + ' was unable to complete. Please see ' + data.response.data.summary + ' for more details.').cyan );
          console.log('Test ' + testId + ' was unable to complete. Please see ' + data.summary + ' for more details.');
        } else {
          // yay! now try to get the actual results
          retrieveResults(data);
        }

      } else {
        // ruh roh! Something is off here.
        // grunt.log.error(data.response.data.statusText);
        console.log(data.statusText);
      }
    });