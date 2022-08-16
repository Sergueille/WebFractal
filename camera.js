"use strict";
let isDragging; // Is the user moving the 2d view?
let lastMousePos; // Last drag position
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
function onMouseMove(ev) {
    if (isDragging) {
        let newPos = new vec2(ev.clientX, ev.clientY);
        let delta = newPos.sub(lastMousePos).divide(canvasSize.y).mult(cameraSize * 2);
        delta.x *= -1;
        cameraPos = cameraPos.add(delta);
        lastMousePos = newPos;
    }
}
function onMouseUp(ev) {
    isDragging = false;
}
function onScroll(ev) {
    shouldSmoothCamera = false;
    let deltaNorm = ev.deltaY > 0 ? 1 : -1;
    targetCameraSize += deltaNorm * scrollSensibility * cameraSize;
}
