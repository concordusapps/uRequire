#!/usr/bin/env node
/*!
 * urequire - version 0.2.9-3
 * Compiled on 2013-01-12
 * git://github.com/anodynos/urequire
 * Copyright(c) 2013 Agelos Pikoulas (agelos.pikoulas@gmail.com )
 * Licensed MIT http://www.opensource.org/licenses/mit-license.php
 */
var version = '0.2.9-3';var cmdOptions, l, options, toArray, urequire, urequireCmd, _;

_ = require('lodash');

urequireCmd = require('commander');

l = require('./utils/logger');

options = {};

toArray = function(val) {
  return val.split(',');
};

urequireCmd.version(version).option('-o, --outputPath <outputPath>', 'Output converted files onto this directory').option('-f, --forceOverwriteSources', 'Overwrite *source* files (-o not needed & ignored)', false).option('-v, --verbose', 'Print module processing information', false).option('-n, --noExports', 'Ignore all web `rootExports` in module definitions', false).option('-r, --webRootMap <webRootMap>', "Where to map `/` when running in node. On RequireJS its http-server's root. Can be absolute or relative to bundle. Defaults to bundle.", false).option('-s, --scanAllow', "By default, ALL require('') deps appear on []. to prevent RequireJS to scan @ runtime. With --s you can allow `require('')` scan @ runtime, for source modules that have no [] deps (eg nodejs source modules).", false).option('-a, --allNodeRequires', 'Pre-require all deps on node, even if they arent mapped to parameters, just like in AMD deps []. Preserves same loading order, but a possible slower starting up. They are cached nevertheless, so you might gain speed later.', false).option('-C --Continue', 'Dont bail out while processing (mainly on module processing errors)', true).option('-u, --uglify', 'NOT IMPLEMENTED. Pass through uglify before saving.', false).option('-w, --watch', 'NOT IMPLEMENTED. Watch for changes in bundle files and reprocess those changed files.', toArray).option('-l, --listOfModules', 'NOT IMPLEMENTED. Process only modules/files in comma sep list - supports wildcards?', toArray).option('-j, --jsonOnly', 'NOT IMPLEMENTED. Output everything on stdout using json only. Usefull if you are building build tools', false).option('-e, --verifyExternals', 'NOT IMPLEMENTED. Verify external dependencies exist on file system.', false).option('-t, --relativeType', 'Either file or bundle relative paths for dependencies.', 'file');

urequireCmd.command('UMD <bundlePath>').description("Converts all .js modules in <bundlePath> using an UMD template").action(function(bundlePath) {
  options.bundlePath = bundlePath;
  return options.template = 'UMD';
});

urequireCmd.command('AMD <bundlePath>').description("Converts with an AMD template, pass through r.js optimizer - see 'urequire AMD -h'").option('-W, --webOptimize', "AMD Web optimizer, through RequireJS r.js\n\n-- NOT IMPLEMENTED. --\n\nPass through r.js optimizer, using build.js & requirejs.config.json", false).action(function(bundlePath) {
  var cmd, _i, _len, _ref, _results;
  options.bundlePath = bundlePath;
  options.template = 'AMD';
  _ref = urequireCmd.commands;
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    cmd = _ref[_i];
    if (cmd._name === 'AMD' && cmd.webOptimize) {
      _results.push(options.webOptimize = cmd.webOptimize);
    } else {
      _results.push(void 0);
    }
  }
  return _results;
});

urequireCmd.command('nodejs <bundlePath>').description("").action(function(bundlePath) {
  options.bundlePath = bundlePath;
  return options.template = 'nodejs';
});

urequireCmd.on('--help', function() {
  return console.log("Examples:\n                                                                \u001b[32m\n  $ urequire UMD path/to/amd/moduleBundle -o umd/moduleBundle   \u001b[0m\n                  or                                            \u001b[32m\n  $ urequire UMD path/to/moduleBundle -f                        \u001b[0m\n\nModule files in your bundle can conform to the standard AMD format:\n    // standard anonymous modules format                  \u001b[33m\n  - define(['dep1', 'dep2'], function(dep1, dep2) {...})  \u001b[0m\n                          or\n    // named modules also work, but are NOT recommended                 \u001b[33m\n  - define('moduleName', ['dep1', 'dep2'], function(dep1, dep2) {...})  \u001b[0m\n\n  A 'relaxed' format can be used, see the docs.\n\nAlternativelly modules can use the nodejs module format:\n  - var dep1 = require('dep1');\n    var dep2 = require('dep2');\n    ...\n    module.exports = {my: 'module'}\n\nNotes:\n  --forceOverwriteSources (-f) is useful if your sources are not `real sources`\n    eg. you use coffeescript :-).\n    WARNING: -f ignores --outputPath");
});

urequireCmd.parse(process.argv);

cmdOptions = _.map(urequireCmd.options, function(o) {
  return o.long.slice(2);
});

options = _.defaults(options, _.pick(urequireCmd, cmdOptions));

options.version = urequireCmd.version();

if (!options.verbose) {
  l.verbose = function() {};
}

if (!options.bundlePath) {
  l.err("Quitting, no bundlePath specified.\nUse -h for help");
  process.exit(1);
} else {
  if (options.forceOverwriteSources) {
    options.outputPath = options.bundlePath;
    l.verbose("Forced output to '" + options.outputPath + "'");
  } else {
    if (!options.outputPath) {
      l.err("Quitting, no --outputPath specified.\nUse -f *with caution* to overwrite sources.");
      process.exit(1);
    } else {
      if (options.outputPath === options.bundlePath) {
        l.err("Quitting, outputPath == bundlePath.\nUse -f *with caution* to overwrite sources (no need to specify --outputPath).");
        process.exit(1);
      }
    }
  }
}

urequire = require('./urequire');

urequire.processBundle(options);
