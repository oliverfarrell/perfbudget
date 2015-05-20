# perfbudget

A stand-alone version of Tim Kadlec's ([@tkadlec](http://twitter.com/tkadlec)) [grunt-perfbudget](https://github.com/tkadlec/grunt-perfbudget) plugin.

**Note:** This is still a work in progress and things are likely to change with each release. As it stands this package works directly in CLI. The underlying code is a little messy and I'll be working to make it easier to integrate with a Node project.

## Installation
```
npm install -g perfbudget
```

## Usage

```
perfbudget --url http://www.bbc.co.uk --key [api_key]
```

**Flags**

- --visualComplete
- --render
- --loadTime
- --docTime
- --fullyLoaded
- --bytesIn
- --bytesInDoc
- --requests
- --requestsDoc
- --SpeedIndex

## TODO

- Remove the need for a `--url` flag. Instead just assume that whatever follows `perfbudget` is the URL.
- Better Node.js intergration
