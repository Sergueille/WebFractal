"use strict";
let isDragging; // Is the user moving the 2d view?
let lastMousePos; // Last drag position
let lastTouchDistance; // Lastdistance between touches (for zoom)
let cameraPos = new vec2(0); // position of the camera
let cameraSize = 1; // sizo of the camera (its height)
let targetCameraSize = 1; // the size that the camera shold have without smoothing
let shouldSmoothCamera = false;
let cameraTargetPos;
const scrollSensibility = 0.1;
const scrollSmooth = 0.05;
const cameraSmooth = 0.2;
function initCamera() {
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onScroll);
    canvas.addEventListener("touchstart", onTouchStart);
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchmove", onTouchMove);
}
function centerCamera() {
    targetCameraSize = 1;
    cameraTargetPos = new vec2(0);
    shouldSmoothCamera = true;
}
function updateCamera() {
    // Update position
    if (shouldSmoothCamera) {
        cameraPos = cameraPos.add(cameraTargetPos.sub(cameraPos).mult(deltaTime).divide(cameraSmooth));
        // Update zoom with more smoothing
        cameraSize += (targetCameraSize - cameraSize) * deltaTime / cameraSmooth;
    }
    else {
        // Update zoom
        cameraSize += (targetCameraSize - cameraSize) * deltaTime / scrollSmooth;
    }
}
function onMouseDown(ev) {
    isDragging = true;
    lastMousePos = new vec2(ev.clientX, ev.clientY);
    shouldSmoothCamera = false;
}
function onTouchStart(ev) {
    isDragging = true;
    lastMousePos = new vec2(ev.touches[0].clientX, ev.touches[0].clientY);
    shouldSmoothCamera = false;
    if (ev.touches.length === 2) {
        let touch0Pos = new vec2(ev.touches[0].clientX, ev.touches[0].clientY);
        let touch1Pos = new vec2(ev.touches[1].clientX, ev.touches[1].clientY);
        lastTouchDistance = touch1Pos.sub(touch0Pos).len();
    }
}
function onMouseMove(ev) {
    if (isDragging) {
        let newPos = new vec2(ev.clientX, ev.clientY);
        let delta = newPos.sub(lastMousePos).divide(canvasSize.y).mult(cameraSize * 2);
        delta.x *= -1;
        cameraPos = cameraPos.add(delta);
        lastMousePos = newPos;
    }
}
function onTouchMove(ev) {
    let touchCount = ev.touches.length;
    if (touchCount === 1) { // Move view
        let touch = ev.touches[0];
        let newPos = new vec2(touch.clientX, touch.clientY);
        let delta = newPos.sub(lastMousePos).divide(canvasSize.y).mult(cameraSize * 2);
        delta.x *= -1;
        cameraPos = cameraPos.add(delta);
        lastMousePos = newPos;
    }
    else if (touchCount === 2) { // Zoom
        let touch0Pos = new vec2(ev.touches[0].clientX, ev.touches[0].clientY);
        let touch1Pos = new vec2(ev.touches[1].clientX, ev.touches[1].clientY);
        let dist = touch1Pos.sub(touch0Pos).len();
        targetCameraSize *= lastTouchDistance / dist;
        cameraSize = targetCameraSize;
        lastTouchDistance = dist;
    }
}
function onMouseUp(ev) {
    isDragging = false;
}
function onTouchEnd(ev) {
    isDragging = false;
}
function onScroll(ev) {
    shouldSmoothCamera = false;
    let deltaNorm = ev.deltaY > 0 ? 1 : -1;
    targetCameraSize += deltaNorm * scrollSensibility * cameraSize;
}
