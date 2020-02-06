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

  // Node is removed
  if (newNode === null) {
    // Real DOM node will be removed when prefer rerendering, so no needs to to anthins
  } else if (_.isString(oldNode) && _.isString(newNode)) {
    // TextNode content replacing
    if (newNode !== oldNode) {
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
  var diffs = listDiff(oldChildren, newChildren, 'key')
  // console.log('diffs>>>', diffs)
  newChildren = diffs.children

  if (diffs.moves.length) {
    var reorderPatch = { type: patch.REORDER, moves: diffs.moves }
    currentPatch.push(reorderPatch)
  }

  var leftNode = null
  var currentNodeIndex = index
  oldChildren.forEach((child, i) => {
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