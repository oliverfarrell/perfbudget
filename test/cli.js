/**
 * Command Line Tests
 */

var mocha = require('mocha'),
    chai = require('chai'),
    expect = chai.expect,
    perfbudget = require('../perfbudget.js'),
    cli = require('../lib/normalizeCli.js');

describe('perfbudget', function() {

  // set timeout to account for time taken to get results
  this.timeout(60000);

  it('should fail if no API Key is provided', function () {
    var options = {
      "url": "http://www.bbc.co.uk",
      "key": "",
      "location": "Dulles:Chrome",
      "wptInstance": "www.webpagetest.org",
      "video": 1,
      "runs": 1,
      "pollResults": 5,
      "timeout": 60,
      "repeatView": false,
      "budget": {
        "render": "1000",
        "SpeedIndex": "1000"
      }
    };

    expect(function() {
      perfbudget.runTest('123', 0);
    }).to.throw();
  });

  // should return metrics
  it('should return results for requested metrics', function (done) {
    var options = {
      "url": "http://www.bbc.co.uk",
      "key": "",
      "location": "Dulles:Chrome",
      "wptInstance": "www.webpagetest.org",
      "video": 1,
      "runs": 1,
      "pollResults": 5,
      "timeout": 60,
      "repeatView": false,
      "budget": {
        "render": "1000",
        "SpeedIndex": "1000"
      }
    };

    perfbudget.runTest(options, function (err) {
      if (err) throw err;
      done();
    });
  });
});
