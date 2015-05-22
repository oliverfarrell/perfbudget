/*
 * perfbudget
 * https://github.com/oliverfarrell/perfbudget
 *
 * Licensed under the MIT license.
 */


/**
 * Normalize cli arguments to match
 * proper options structre
 *
 * @param  {Object} argv cli arguments
 * @return {Object}      options
 */
module.exports = function(argv) {
  options = {
    budget : {}
  }

  // url
  if(argv.url) options.url = argv.url;

  // wpt instance
  if(argv.instance) options.wptInstance = argv.instance;

  // api key
  if(argv.key) options.key = argv.key;

  // location
  if(argv.location) options.location = argv.location;

  // visual complete
  if(argv.visualComplete) options.budget.visualComplete = argv.visualComplete;

  // render
  if(argv.render) options.budget.render = argv.render;

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

  return options;
}
