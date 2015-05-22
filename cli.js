#! /usr/bin/env node

/*
 * perfbudget
 * https://github.com/oliverfarrell/perfbudget
 *
 * Licensed under the MIT license.
 */

'use strict';

var argv = require('minimist')(process.argv.slice(2)),
    colors = require('colors'),
    options = require('./lib/normalizeCli')(argv),
    perfbudget = require('./perfbudget');

perfbudget.runTest(options, function(err, result) {
  if (err) {
    console.log(err);

    process.exit(1);
  }

  // output our header and results
  if (!result.pass) {
    console.log(
      '\n-----------------------------------------------' +
      '\nTest for ' + result.options.url + ' \t ' + colors.red('[FAILED]') +
      '\n-----------------------------------------------\n'
    );
    console.log(result.msg);
    console.log('Summary: ' + result.summary);

    process.exit(1);
  } else {
    console.log(
      '\n-----------------------------------------------' +
      '\nTest for ' + result.options.url + ' \t ' + colors.green('[PASSED]') +
      '\n-----------------------------------------------\n'
    );
    console.log(result.msg);
    console.log('Summary: ' + result.summary);

    process.exit();
  }
});
