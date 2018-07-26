const defaultPosition = {
  x: 0,
  y: 0
}

const mouseEvent = /mouse(down|move|up)/
const touchEvent = /touch(start|move|end)/

export function getEventPosition (e) {
  if (!e) return defaultPosition
  if (touchEvent.test(e.type)) {
    let touch = e.touches[0]
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  } else if (mouseEvent.test(e.type)) {
    return {
      x: e.clientX,
      y: e.clientY
    }
  }
  return defaultPosition
}

export const requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60)
  }

export function preventDefaultException (el, exceptions) {
  for (let i in exceptions) {
    if (exceptions[i].test(el[i])) {
      return true
    }
  }
  return false
}

export function assign (target, varArgs) { // .length of function is 2
  if (target == null) { // TypeError if undefined or null
    throw new TypeError('Cannot convert undefined or null to object')
  }

  var to = Object(target)

  for (var index = 1; index < arguments.length; index++) {
    var nextSource = arguments[index]

    if (nextSource) { // Skip over if undefined or null
      for (var nextKey in nextSource) {
        // Avoid bugs when hasOwnProperty is shadowed
        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
          to[nextKey] = nextSource[nextKey]
        }
      }
    }
  }
  return to
}

const prefixs = ['ms', 'Moz', 'Webkit', 'O']
const prefixCache = {}
function getPrefix (_key) {
  if (prefixCache[_key]) return prefixCache[_key]
  const key = _key[0].toUpperCase() + _key.slice(1, _key.length)
  prefixCache[_key] = prefixs.map(p => p + key)
  return prefixCache[_key]
}

export function setStyle (el, key, value, usePrefix) {
  el.style[key] = value
  if (!usePrefix) return
  const keys = getPrefix(key)
  keys.map(prefixedKey => {
    el.style[prefixedKey] = value
  })
}

export function inView (el, preLoad = 1) {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight * preLoad &&
  rect.bottom > 0 &&
  rect.left < window.innerWidth * preLoad &&
  rect.right > 0
}

export function find (arr, handler) {
  for (let i = 0, len = arr.length; i < len; i++) {
    if (handler(arr[i], i)) {
      return arr[i]
    }
  }
}
