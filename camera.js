"use strict";
let isDragging; // Is the user moving the 2d view?
let lastMousePos; // Last drag position
let lastTouchDistance; // Last distance between touches (for zoom)
let wasZoomingLastFrame; // Was zooming last frame
let lastTouchCount;
let cameraPos = new vec2(0); // position of the camera
let cameraSize = 1; // sizo of the camera (its height)
let targetCameraSize = 1; // the size that the camera shold have without smoothing
let shouldSmoothCamera = false;
let cameraTargetPos;
let currentMousePos;
const scrollSensibility = 0.1;
const scrollSmooth = 0.05;
const cameraSmooth = 0.2;
function initCamera() {
    canvas.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
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
        if (Math.abs(targetCameraSize - cameraSize) < 0.005 && cameraTargetPos.sub(cameraPos).len() < 0.005)
            shouldSmoothCamera = false;
    }
    else {
        // Update zoom
        let zoomAmount = (targetCameraSize - cameraSize) * deltaTime / scrollSmooth;
        // Move camera towards pointer
        if (Math.abs(zoomAmount) >= 0.00001) {
            let screenPos = currentMousePos.divide(canvasSize.y);
            screenPos.y = 1 - screenPos.y;
            let zoomCenter = screenPos.sub(new vec2(canvasSize.x / canvasSize.y * 0.5, 0.5)).mult(cameraSize * 2);
            cameraPos = cameraPos.add(zoomCenter.mult(1 - (cameraSize + zoomAmount) / cameraSize));
        }
        cameraSize += zoomAmount;
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
    currentMousePos = new vec2(ev.clientX, ev.clientY);
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
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < touchCount; i++) {
        sumX = ev.touches[i].clientX;
        sumY = ev.touches[i].clientY;
    }
    let newPos = new vec2(sumX / touchCount, sumY / touchCount);
    // Ignore if touch count changed
    if (lastTouchCount == touchCount) {
        // Move view
        let delta = newPos.sub(lastMousePos).divide(canvasSize.y).mult(cameraSize * 2);
        delta.x *= -1;
        cameraPos = cameraPos.add(delta);
        if (touchCount === 2) { // Zoom
            let touch0Pos = new vec2(ev.touches[0].clientX, ev.touches[0].clientY);
            let touch1Pos = new vec2(ev.touches[1].clientX, ev.touches[1].clientY);
            let dist = touch1Pos.sub(touch0Pos).len();
            if (wasZoomingLastFrame) {
                targetCameraSize *= lastTouchDistance / dist;
                // cameraSize = targetCameraSize;
            }
            lastTouchDistance = dist; // BUG last dist is not set on the first time
            wasZoomingLastFrame = true;
        }
        else {
            wasZoomingLastFrame = false;
        }
    }
    else {
        wasZoomingLastFrame = false;
    }
    lastMousePos = newPos;
    lastTouchCount = touchCount;
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
function getCamraString() {
    return `${Math.round(cameraPos.x * 1e6) / 1e6},${Math.round(cameraPos.y * 1e6) / 1e6},${Math.round(cameraSize * 1e6) / 1e6}`;
}
