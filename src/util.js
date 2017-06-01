const defaultPosition = {
  x: 0,
  y: 0
}

const mouseEvent = /mouse/

export function getEventPosition (e) {
  if (!e) return defaultPosition
  if (e.type === 'touchmove') {
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
