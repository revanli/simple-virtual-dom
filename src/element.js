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