let divLeft = 200;
let divTop = 100;
let mouseOffsetX = 0;
let mouseOffsetY = 0;
let dragging = false
let direction = 1;

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
  const div = document.getElementById('viewport1')
  const rect = div.getBoundingClientRect()
  divLeft = rect.left
  divTop = rect.top
}

document.addEventListener('DOMContentLoaded', () => {
  const div = document.getElementById('viewport1')
  div.addEventListener("mousedown", onMouseDown)
  document.addEventListener("mouseup", onMouseUp)
  document.addEventListener("mousemove", onMouseMove)
})

setInterval(() => {

  config = document.getElementById('Configuration')?.components["configure-example"]?.data

  if (!config?.moveSideToSide) return
  
  const div = document.getElementById('viewport1')
  if (!dragging) {
    const rect = div.getBoundingClientRect()

    const hitLeft = (rect.left < 5)
    const hitRight = (rect.right > window.innerWidth - 5)
    if (hitLeft) {
      direction = 1
    }
    if (hitRight) {
      direction = -1
    }

    if (!hitLeft || !hitRight) {
      divLeft += (direction * 4)
      div.style.left = `${divLeft}px`
    }
  }
}, 40)
