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