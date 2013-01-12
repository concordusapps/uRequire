var log, seekr, _;

_ = require('lodash');

log = console.log;

seekr = function(seekers, data, stackreader, ctx, _level, _continue, _stack) {
  if (_level == null) {
    _level = 0;
  }
  if (_continue == null) {
    _continue = true;
  }
  if (_stack == null) {
    _stack = [];
  }
  _level++;
  if (_level === 1) {
    if (!_(seekers).isArray()) {
      seekers = [seekers];
    }
  }
  if (_continue) {
    return _(data).each(function(dataItem) {
      var deadSeekers, s, skr, stacktop, _i, _len, _ref, _ref1, _ref2, _ref3;
      if (_(dataItem).isObject() || _(dataItem).isArray()) {
        _stack.push(dataItem);
        seekr(seekers, dataItem, stackreader, ctx, _level, _continue, _stack);
        return _stack.pop();
      } else {
        stacktop = _stack[_stack.length - 1];
        deadSeekers = [];
        for (_i = 0, _len = seekers.length; _i < _len; _i++) {
          skr = seekers[_i];
          if (_level >= ((_ref = (_ref1 = skr.level) != null ? _ref1.min : void 0) != null ? _ref : 0) && _level <= ((_ref2 = (_ref3 = skr.level) != null ? _ref3.max : void 0) != null ? _ref2 : 99999)) {
            if (_(skr['_' + dataItem]).isFunction()) {
              if (stackreader[dataItem]) {
                s = skr['_' + dataItem].call(ctx, stackreader[dataItem](stacktop));
                if (s === 'stop') {
                  deadSeekers.push(skr);
                }
              }
            }
          }
        }
        seekers = _.difference(seekers, deadSeekers);
        return _continue = !_(seekers).isEmpty();
      }
    });
  }
};

module.exports = seekr;
