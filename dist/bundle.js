(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.svd = require('./src/index')
},{"./src/index":4}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
function Element(tagName, props, children) {
  this.tagName = tagName
  this.props = props || {}
  this.children = children || []
}

module.exports = function(tagName, props, children) {
  return new Element(tagName, props, children)
}
},{}],4:[function(require,module,exports){
exports.el = require('./element')
exports.diff = require('./diff')
exports.patch = require('./patch')
},{"./diff":2,"./element":3,"./patch":5}],5:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}]},{},[1]);
