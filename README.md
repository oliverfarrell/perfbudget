# perfbudget

[![Build Status](https://travis-ci.org/oliverfarrell/perfbudget.svg?branch=master)](https://travis-ci.org/oliverfarrell/perfbudget)

A stand-alone version of Tim Kadlec's ([@tkadlec](http://twitter.com/tkadlec)) [grunt-perfbudget](https://github.com/tkadlec/grunt-perfbudget) plugin.

**Note:** This is still a work in progress and things are likely to change with each release. As it stands this package works directly in CLI. I'll be working to make it easier to integrate with a Node project.

## Installation
```
# cli usage
$ npm install -g perfbudget

# node module usage
$ npm install perfbudget
```

## Usage

### CLI

```
# using www.webpagetest.org
$ perfbudget --url http://www.bbc.co.uk --key [api_key]

# using private instance
$ perfbudget --url http://www.bbc.co.uk --instance [instance_url] --key [api_key] --location [location]

# setting budgets
$ perfbudget --url http://www.bbc.co.uk --key [api_key] --SpeedIndex 2000 --render 400
```

**Flags**

Config:

- `--url` - URL you want WPT to run against | default : `""`
- `--key` - API key for WPT instance | default : `""`
- `--instance` - WPT instance to use | default : `www.webpagetest.org`
- `--location` - WPT location to use | default : `Dulles:Chrome`

Budget:

- `--visualComplete` | default : `""`
- `--render` | default : `"1000"`
- `--loadTime` | default : `""`
- `--docTime` | default : `""`
- `--fullyLoaded` | default : `""`
- `--bytesIn` | default : `""`
- `--bytesInDoc` | default : `""`
- `--requests` | default : `""`
- `--requestsDoc` | default : `""`
- `--SpeedIndex` | default : `"1000"`

### Node module

```
var perfbudget = require('perfbudget');

perfbudget.runTest(options, function(err, result) {
  if (err) {
    return console.log(err);
  }

  if (!result.pass) {
    console.log(
      '\n-----------------------------------------------' +
      '\nTest for ' + result.options.url + ' \t ' + colors.red('[FAILED]') +
      '\n-----------------------------------------------\n'
    );
    console.log(result.msg);
    console.log('Summary: ' + result.summary);
  } else {
    console.log(
      '\n-----------------------------------------------' +
      '\nTest for ' + result.options.url + ' \t ' + colors.green('[PASSED]') +
      '\n-----------------------------------------------\n'
    );
    console.log(result.msg);
    console.log('Summary: ' + result.summary);
  }
});
```


## TODO

- Remove the need for a `--url` flag. Instead just assume that whatever follows `perfbudget` is the URL.
- Better Node.js intergration
