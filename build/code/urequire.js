var Urequire;

Urequire = (function() {

  function Urequire() {}

  Function.prototype.property = function(props) {
    var descr, name, _results;
    _results = [];
    for (name in props) {
      descr = props[name];
      _results.push(Object.defineProperty(this.prototype, name, descr));
    }
    return _results;
  };

  Urequire.property({
    processBundle: {
      get: function() {
        return require("./process/processBundle");
      }
    }
  });

  Urequire.property({
    NodeRequirer: {
      get: function() {
        return require('./NodeRequirer');
      }
    }
  });

  return Urequire;

})();

module.exports = new Urequire;
