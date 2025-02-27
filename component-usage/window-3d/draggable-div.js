
let divLeft = 0;
let divTop = 0;
let mouseOffsetX = 0;
let mouseOffsetY = 0;
let dragging = false

const onMouseMove = (e) => {

  if (!dragging) return

  divLeft = e.clientX - mouseOffsetX
  divTop = e.clientY - mouseOffsetY
  const div = document.getElementById('viewport1')
  div.style.left = `${divLeft}px`
  div.style.top = `${divTop}px`
}

const onMouseDown = (e) => {
  dragging = true
  mouseOffsetX = e.offsetX;
  mouseOffsetY = e.offsetY;
}

const onMouseUp = (e) => {
  dragging = false
}

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('viewport1')
  div.addEventListener("mousedown", onMouseDown)
  document.addEventListener("mouseup", onMouseUp)
  document.addEventListener("mousemove", onMouseMove)
})
