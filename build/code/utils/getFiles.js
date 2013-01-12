var getFiles;

getFiles = function(path, conditionCb) {
  var files, mFile, mp, _fs, _i, _len, _path, _ref, _wrench;
  _path = require('path');
  _wrench = require('wrench');
  _fs = require('fs');
  files = [];
  _ref = _wrench.readdirSyncRecursive(path);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    mp = _ref[_i];
    mFile = _path.join(path, mp);
    if (_fs.statSync(mFile).isFile()) {
      if (conditionCb) {
        if (conditionCb(mFile)) {
          files.push(mp.replace(/\\/g, '/'));
        }
      }
    }
  }
  return files;
};

module.exports = getFiles;
