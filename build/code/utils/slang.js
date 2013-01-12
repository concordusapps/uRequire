var __slice = [].slice;

module.exports = {
  certain: function(o) {
    return function(key) {
      var _ref;
      return (_ref = o[key]) != null ? _ref : o['*'];
    };
  },
  /*
    # a helper to create an object literal
    # with a dynamic keys on the fly.
    # js/coffee dont like this right now :-(
    # @param {String...} keyValPairs key,value pairs
  */

  objkv: function() {
    var idx, key, keyValPairs, obj, _i, _len, _step;
    obj = arguments[0], keyValPairs = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (idx = _i = 0, _len = keyValPairs.length, _step = 2; _i < _len; idx = _i += _step) {
      key = keyValPairs[idx];
      obj[key] = keyValPairs[idx + 1];
    }
    return obj;
  }
};
