(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.svd = require('./src/index')
},{"./src/index":4}],2:[function(require,module,exports){
var _ = require('./utils')

var patch = require('./patch')

// 对比两棵树
function diff(oldTree, newTree) {
  // 当前节点标志
  var index = 0
  // 记录每个节点差异的对象
  var patches = {}
  dfsWalk(oldTree, newTree, index, patches)
  return patches
}

// 先序深度优先遍历两棵树，对比oldNode和newNode
function dfsWalk(oldNode, newNode, index, patches) {
  var currentPatch = []

  // Node is removed
  if (newNode === null) {
    // Real DOM node will be removed when prefer rerendering, so no needs to to anthins
  } else if (_.isString(oldNode) && _.isString(newNode)) {
    // TextNode content replacing
    if (newNode !== oldNode) {
      currentPatch.push({ type: pathch.TEXT })
    }
  } else if (
    // Nodes are the same, diff old node's props and children
    oldNode.tagName === newNode.tagName &&
    oldNode.key === newNode.key
  ) {
    // diff props
    var propsPatches = diffProps(oldNode, newNode)
    if (propsPatches) {
      currentPatch.push({ type: patch.PROPS, props: propsPatches })
    }

    // diff children
    diffChildren(oldNode.children, newNode.children, index, patches, currentPatch)
  } else {
    // Nodes are not same, replace the old with new node
    currentPatch.push({ type: patch.REPLACE, node: newNode })
  }

  if (currentPatch.length) {
    patches[index] = currentPatch
  }
}

function diffProps(oldNode, newNode) {
  
}

// 遍历子节点
function diffChildren(oldChildren, newChildren, index, patches) {
  
}

module.exports = diff
},{"./patch":5,"./utils":6}],3:[function(require,module,exports){
var _ = require('./utils')

/**
 * Virtual-dom Element
 *
 * @param   {String}  tagName
 * @param   {Object}  props  - Element properties
 *                           - use Object to store key-value pair
 * @param   {Array<Element|String>}  children  - children elements
 *                                   - Element instance or plain text
 */
function Element(tagName, props, children) {
  if (!(this instanceof Element)) {
    return new Element(tagName, props, children)
  }
  this.tagName = tagName
  this.props = props || {}
  this.children = children || []
  this.key = props.key
}

/**
 * turn virtual dom to dom
 */
Element.prototype.render = function() {
  // 根据tagName创建元素
  var el = document.createElement(this.tagName)
  var props = this.props

  // 遍历props并调用setAttribute方法
  for (var propName in props) {
    var propValue = props[propName]
    _.setAttr(el, propName, propValue)
  }

  this.children.forEach(function(child) {
    var childEl = (child instanceof Element)
      // 子节点是虚拟DOM，递归构建DOM节点
      ? child.render()
      // 其他是字符串，构建文本节点
      : document.createTextNode(child)
    el.appendChild(childEl)
  })

  return el
}

module.exports = Element
},{"./utils":6}],4:[function(require,module,exports){
module.exports.el = require('./element')
module.exports.diff = require('./diff')
module.exports.patch = require('./patch')
},{"./diff":2,"./element":3,"./patch":5}],5:[function(require,module,exports){
var _ = require('./utils')

const REPLACE = 0
const REORDER = 1
const PROPS = 2
const TEXT = 3

function patch(node, patches) {

}

patch.REPLACE = REPLACE
patch.REORDER = REORDER
patch.PROPS = PROPS
patch.TEXT = TEXT

module.exports = patch
},{"./utils":6}],6:[function(require,module,exports){
var _ = module.exports

_.type = function(obj) {
  return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '')
}

_.isArray = function(list) {
  return type(list) === 'Array'
}

_.slice = function(arrayLike, index) {
  return Array.prototype.slice.call(arrayLike, index)
}

_.isString = function(strLike) {
  return type(strLike) === 'string'
}

_.each = function(array, fn) {
  for (var i = 0, len = array.length; i < len; i++) {
    fn(array[i], i)
  }
}

_.toArray = function(listLike) {
  if (!listLike) {
    return []
  }

  var list = []

  for (var i = 0, len = listLike.length; i < len; i++) {
    list.push(listLike[i])
  }

  return list
}

_.setAttr = function(node, key, value) {
  switch(key) {
    case 'style':
      node.style.cssText = value
      break
    case 'value':
      var tagName = node.tagName || ''
      tagName = tagName.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea') {
        node.value = value
      } else {
        // if not a input or textarea, use 'setAttribute' instead
        node.setAttribute(key, value)
      }
      break
    default:
      node.setAttribute(key, value)
      break
  }
}
},{}]},{},[1]);
