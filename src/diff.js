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