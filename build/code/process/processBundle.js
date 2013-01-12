var version = '0.2.9-3';var DependenciesReporter, convertModule, getFiles, l, processBundle, processModule, upath, _, _fs, _wrench;

_ = require('lodash');

_fs = require('fs');

upath = require('../paths/upath');

_wrench = require('wrench');

getFiles = require("./../utils/getFiles");

DependenciesReporter = require('./../DependenciesReporter');

convertModule = require('./convertModule');

l = require('./../utils/logger');

processModule = function(modyle, bundleFiles, options, reporter) {
  var newJs, oldJs, outputFile;
  l.verbose('\nProcessing module: ', modyle);
  oldJs = _fs.readFileSync("" + options.bundlePath + "/" + modyle, 'utf-8');
  newJs = convertModule(modyle, oldJs, bundleFiles, options, reporter);
  outputFile = upath.join(options.outputPath, modyle);
  if (!(_fs.existsSync(upath.dirname(outputFile)))) {
    l.verbose("creating directory " + (upath.dirname(outputFile)));
    _wrench.mkdirSyncRecursive(upath.dirname(outputFile));
  }
  return _fs.writeFileSync(outputFile, newJs, 'utf-8');
};

/*
  Processes each .js file in 'bundlePath', extracting AMD/module information
  It then tranforms each file using template to 'outputPath'

  { bundlePath: 'build/examples/spec',
  version: '0.1.9',
  forceOverwriteSources: true,
  webRootMap: false,
  outputPath: 'build/examples/spec' }


  TODO: refactor it
  TODO: test it
  TODO: doc it
*/


processBundle = function(options) {
  var bundleFiles, interestingDepTypes, jsFiles, modyle, reporter, _i, _len;
  l.verbose("uRequire " + options.version + ": Processing bundle with options:\n", options);
  interestingDepTypes = ['notFoundInBundle', 'untrustedRequireDependencies', 'untrustedAsyncDependencies'];
  reporter = new DependenciesReporter(options.verbose ? null : interestingDepTypes);
  try {
    bundleFiles = getFiles(options.bundlePath, function() {
      return true;
    });
    jsFiles = getFiles(options.bundlePath, function(fileName) {
      return (upath.extname(fileName)) === '.js';
    });
  } catch (err) {
    l.err("*uRequire " + version + "*: Something went wrong reading from " + options.bundlePath + ". Error=\n", err);
    process.exit(1);
  }
  l.verbose('\nBundle files found: \n', bundleFiles, '\nJs files found: \n', jsFiles);
  for (_i = 0, _len = jsFiles.length; _i < _len; _i++) {
    modyle = jsFiles[_i];
    try {
      processModule(modyle, bundleFiles, options, reporter);
    } catch (err) {
      l.err("*uRequire " + version + "*: Something went wrong when processing " + modyle + ". Error=\n", err);
      if (!options.Continue) {
        process.exit(1);
      }
    }
  }
  if (!_.isEmpty(reporter.reportData)) {
    l.log('\n########### urequire, final report ########### :\n', reporter.getReport());
  }
  return null;
};

module.exports = processBundle;
