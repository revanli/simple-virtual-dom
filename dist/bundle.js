(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.svd = require('./src/index')
},{"./src/index":4}],2:[function(require,module,exports){
var _ = require('./utils')

var patch = require('./patch')
var listDiff = require('./list-diff').listDiff

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
  console.log('dfsWalk>>>', oldNode, newNode)

  // Node is removed
  if (newNode === null) {
    // Real DOM node will be removed when prefer rerendering, so no needs to to anthins
  } else if (_.isString(oldNode) && _.isString(newNode)) {
    // TextNode content replacing
    if (newNode !== oldNode) {
      console.log('newNode>>>', newNode)
      currentPatch.push({ type: patch.TEXT, content: newNode })
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

    diffChildren(
      oldNode.children || [],
      newNode.children || [],
      index,
      patches,
      currentPatch
    )
  // Nodes are not the same, replace the old node with new node
  } else {
    // Nodes are not same, replace the old with new node
    currentPatch.push({ type: patch.REPLACE, node: newNode })
  }

  if (currentPatch.length) {
    patches[index] = currentPatch
  }
}

// 遍历子节点
function diffChildren(oldChildren, newChildren, index, patches, currentPatch) {
  // TODO: list diff detail
  var diffs = listDiff(oldChildren, newChildren, 'key')
  newChildren = diffs.children

  if (diffs.moves.length) {
    var reorderPatch = { type: patch.REORDER, moves: diffs.moves }
    currentPatch.push(reorderPatch)
  }

  var leftNode = null
  var currentNodeIndex = index
  oldChildren.forEach((child, i) => {
    console.log('child>>>', child)
    var newChild = newChildren[i]
    currentNodeIndex = (leftNode && leftNode.count)
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1
    dfsWalk(child, newChild, currentNodeIndex, patches)
    leftNode = child
  })
}

/**
 * compare newProps between oldProps, 
 * find out diffeernt properties and new properties
 *
 * @param   {Object}  oldNode  el(tagName, props, children)
 * @param   {Object}  newNode  el(tagName, props, children)
 */
function diffProps(oldNode, newNode) {
  var count = 0
  var oldProps = oldNode.props
  var newProps = newNode.props

  var key, value
  var propsPatches = {}

  // Find out different properties
  for (key in oldProps) {
    value = oldProps[key]
    if (newProps[key] !== value) {
      count++
      propsPatches[key] = newProps[key]
    }
  }

  // Find out new property
  for (key in newProps) {
    value = newProps[key]
    if (!oldProps.hasOwnProperty(key)) {
      count++
      propsPatches[key] = newProps[key]
    }
  }

  // if props not change or don't have new property
  if (count === 0) {
    return null
  }

  return propsPatches
}

module.exports = diff
},{"./list-diff":5,"./patch":6,"./utils":7}],3:[function(require,module,exports){
var _ = require('./utils')

/**
 * Virtual-dom Element
 *
 * @param   {String}  tagName
 * @param   {Object|undefined}  props  - Element properties
 *                                     - use Object to store key-value pair
 * @param   {Array<Element|String>}  children  - children elements
 *                                             - Element instance or plain text
 * example: ('h1', {style: 'color: blue'}, ['simple virtal dom']),
 * ('p', ['Hello, virtual-dom'])
 * 
 */
function Element(tagName, props, children) {
  if (!(this instanceof Element)) {
    if (!_.isArray(children) && children != null) {
      children = _.slice(arguments, 2).filter(value => !!value)
    }
    return new Element(tagName, props, children)
  }

  if (_.isArray(props)) {
    children = props
    props = {}
  }
  
  this.tagName = tagName
  this.props = props || {}
  this.children = children || []
  this.key = props ? props.key : void 666

  var count = 0

  this.children.forEach((child, i) => {
    if (child instanceof Element) {
      count += child.count
    } else {
      children[i] = '' + child
    }
    count++
  })

  this.count = count
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
},{"./utils":7}],4:[function(require,module,exports){
module.exports.el = require('./element')
module.exports.diff = require('./diff')
module.exports.patch = require('./patch')
},{"./diff":2,"./element":3,"./patch":6}],5:[function(require,module,exports){
/**
 * Diff two list in O(N).
 * @param {Array} oldList - Original List
 * @param {Array} newList - List After certain insertions, removes, or moves
 * @return {Object} - {moves: <Array>}
 *                  - moves is a list of actions that telling how to remove and insert
 */
function listDiff (oldList, newList, key) {
  var oldMap = makeKeyIndexAndFree(oldList, key)
  var newMap = makeKeyIndexAndFree(newList, key)

  var newFree = newMap.free

  var oldKeyIndex = oldMap.keyIndex
  var newKeyIndex = newMap.keyIndex

  var moves = []

  // a simulate list to manipulate
  var children = []
  var i = 0
  var item
  var itemKey
  var freeIndex = 0

  // first pass to check item in old list: if it's removed or not
  while (i < oldList.length) {
    item = oldList[i]
    itemKey = getItemKey(item, key)
    if (itemKey) {
      if (!newKeyIndex.hasOwnProperty(itemKey)) {
        children.push(null)
      } else {
        var newItemIndex = newKeyIndex[itemKey]
        children.push(newList[newItemIndex])
      }
    } else {
      var freeItem = newFree[freeIndex++]
      children.push(freeItem || null)
    }
    i++
  }

  var simulateList = children.slice(0)

  // remove items no longer exist
  i = 0
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i)
      removeSimulate(i)
    } else {
      i++
    }
  }

  // i is cursor pointing to a item in new list
  // j is cursor pointing to a item in simulateList
  var j = i = 0
  while (i < newList.length) {
    item = newList[i]
    itemKey = getItemKey(item, key)

    var simulateItem = simulateList[j]
    var simulateItemKey = getItemKey(simulateItem, key)

    if (simulateItem) {
      if (itemKey === simulateItemKey) {
        j++
      } else {
        // new item, just inesrt it
        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
          insert(i, item)
        } else {
          // if remove current simulateItem make item in right place
          // then just remove it
          var nextItemKey = getItemKey(simulateList[j + 1], key)
          if (nextItemKey === itemKey) {
            remove(i)
            removeSimulate(j)
            j++ // after removing, current j is right, just jump to next one
          } else {
            // else insert item
            insert(i, item)
          }
        }
      }
    } else {
      insert(i, item)
    }

    i++
  }

  //if j is not remove to the end, remove all the rest item
  var k = simulateList.length - j
  while (j++ < simulateList.length) {
    k--
    remove(k + i)
  }


  function remove (index) {
    var move = {index: index, type: 0}
    moves.push(move)
  }

  function insert (index, item) {
    var move = {index: index, item: item, type: 1}
    moves.push(move)
  }

  function removeSimulate (index) {
    simulateList.splice(index, 1)
  }

  return {
    moves: moves,
    children: children
  }
}

/**
 * Convert list to key-item keyIndex object.
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree (list, key) {
  var keyIndex = {}
  var free = []

  for (var i = 0, len = list.length; i < len; i++) {
    var item = list[i]
    var itemKey = getItemKey(item, key)
    if (itemKey) {
      keyIndex[itemKey] = i
    } else {
      free.push(item)
    }
  }
  return {
    keyIndex: keyIndex,
    free: free
  }
}

function getItemKey (item, key) {
  if (!item || !key) return void 666
  return typeof key === 'string'
    ? item[key]
    : key(item)
}

exports.listDiff = listDiff
},{}],6:[function(require,module,exports){
var _ = require('./utils')

const REPLACE = 0
const REORDER = 1
const PROPS = 2
const TEXT = 3

function patch(node, patches) {
  var walker = { index: 0 }
  dfsWalk(node, walker, patches)
}

function dfsWalk(node, walker, patches) {
  var currentPatches = patches[walker.index]

  var len = node.childNodes
    ? node.childNodes.length
    : 0
  
  for (var i = 0; i < len; i++) {
    var child = node.childNodes[i]
    walker.index++
    dfsWalk(child, walker, patches)
  }

  if (currentPatches) {
    applyPatches(node, currentPatches)
  }
}

function applyPatches(node, currentPatches) {
  currentPatches.forEach(currentPatch => {
    switch(currentPatch.type) {
      case REPLACE:
        var newNode = (typeof currentPatch.node === 'string')
          ? document.createTextNode(currentPatch.node)
          : currentPatch.node.render()
          node.parentNode.replaceChild(newNode, node)
        break;
      case PROPS:
        setProps(node, currentPatch.props)
        break;
      case REORDER:
        reorderChildren(node, currentPatch.moves)
        break;
      case TEXT:
        if (node.textContent) {
          node.textContent = currentPatch.content
        }
        break;
      default: 
        throw new Error('Unknown patch type' + currentPatch.type)
    }
  })
}

function setProps (node, props) {
  console.log('props>>>', props)
  for (var key in props) {
    if (props[key] === void 666) {
      node.removeAttribute(key)
    } else {
      var value = props[key]
      _.setAttr(node, key, value)
    }
  }
}

function reorderChildren (node, moves) {
  var staticNodeList = _.toArray(node.childNodes)
  var maps = {}

  staticNodeList.forEach(function (node) {
    if (node.nodeType === 1) {
      var key = node.getAttribute('key')
      if (key) {
        maps[key] = node
      }
    }
  })

  moves.forEach(function (move) {
    var index = move.index
    if (move.type === 0) { // remove item
      if (staticNodeList[index] === node.childNodes[index]) { // maybe have been removed for inserting
        node.removeChild(node.childNodes[index])
      }
      staticNodeList.splice(index, 1)
    } else if (move.type === 1) { // insert item
      var insertNode = maps[move.item.key]
        ? maps[move.item.key].cloneNode(true) // reuse old item
        : (typeof move.item === 'object')
            ? move.item.render()
            : document.createTextNode(move.item)
      staticNodeList.splice(index, 0, insertNode)
      node.insertBefore(insertNode, node.childNodes[index] || null)
    }
  })
}

patch.REPLACE = REPLACE
patch.REORDER = REORDER
patch.PROPS = PROPS
patch.TEXT = TEXT

module.exports = patch
},{"./utils":7}],7:[function(require,module,exports){
var _ = module.exports

_.type = function(obj) {
  return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g, '')
}

_.isArray = function(list) {
  return _.type(list) === 'Array'
}

_.slice = function(arrayLike, index) {
  return Array.prototype.slice.call(arrayLike, index)
}

_.isString = function(strLike) {
  return _.type(strLike) === 'String'
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
