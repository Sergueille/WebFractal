let isDragging: boolean; // Is the user moving the 2d view?
let lastMousePos: vec2; // Last drag position
let lastTouchDistance: number; // Last distance between touches (for zoom)
let wasZoomingLastFrame: boolean; // Was zooming last frame
let lastTouchCount: number;

let dragVelocity = new vec2(0, 0);
const dragVelocityLoss = 2;
let dragAverageSpeed = new vec2(0, 0);
const dragAverageSpeedWeight = 0.7;

let cameraPos: vec2 = new vec2(0); // position of the camera
let cameraSize: number = 1; // sizo of the camera (its height)
let targetCameraSize: number = 1; // the size that the camera shold have without smoothing
let shouldSmoothCamera = false;
let cameraTargetPos: vec2;
let currentMousePos: vec2;

const scrollSensibility: number = 0.1;
const scrollSmooth: number = 0.05;
const cameraSmooth: number = 0.2;

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
        addZoom(zoomAmount);

        if (!isDragging) {
            cameraPos = cameraPos.add(dragVelocity);
            dragVelocity = dragVelocity.mult(1 - dragVelocityLoss * deltaTime);
        }
    }

    if (isDragging) { // ragging but mouse is still
        dragAverageSpeed = dragAverageSpeed.mult(dragAverageSpeedWeight);
        dragVelocity = dragAverageSpeed;
    }
}

function onMouseDown(ev: MouseEvent) {
    isDragging = true;
    lastMousePos = new vec2(ev.clientX, ev.clientY);
    shouldSmoothCamera = false;
    dragVelocity = new vec2(0, 0);
    dragAverageSpeed = new vec2(0, 0);
}

function onTouchStart(ev: TouchEvent) {
    isDragging = true;
    lastMousePos = new vec2(ev.touches[0].clientX, ev.touches[0].clientY);
    shouldSmoothCamera = false;
}

function onMouseMove(ev: MouseEvent) {
    currentMousePos = new vec2(ev.clientX, ev.clientY);

    if (isDragging) {
        let newPos = new vec2(ev.clientX, ev.clientY);
        let delta = newPos.sub(lastMousePos).divide(canvasSize.y).mult(cameraSize * 2);
        delta.x *= -1;
        cameraPos = cameraPos.add(delta);

        // TEST: move this on touches
        dragAverageSpeed = dragAverageSpeed.mult(dragAverageSpeedWeight).add(delta.mult(1 - dragAverageSpeedWeight));
        dragVelocity = dragAverageSpeed;

        lastMousePos = newPos;
    }
}

function onTouchMove(ev: TouchEvent) {
    let touchCount = ev.touches.length;

    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < touchCount; i++)
    {
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
                addZoom(cameraSize * lastTouchDistance / dist - cameraSize);
            }

            lastTouchDistance = dist;
            wasZoomingLastFrame = true;
        }
        else {
            wasZoomingLastFrame = false;
        }
    } else {
        wasZoomingLastFrame = false;
    }
    
    lastMousePos = newPos;
    lastTouchCount = touchCount;
}

function onMouseUp(ev: MouseEvent) {
    isDragging = false;
}

function onTouchEnd(ev: TouchEvent) {
    isDragging = false;
}

function onScroll(ev: WheelEvent) {
    shouldSmoothCamera = false;
    let deltaNorm = ev.deltaY > 0 ? 1 : -1;
    targetCameraSize += deltaNorm * scrollSensibility * cameraSize;
}

function getCameraString() {
    return `${Math.round(cameraPos.x * 1e6) / 1e6},${Math.round(cameraPos.y * 1e6) / 1e6},${Math.round(cameraSize * 1e6) / 1e6}`
}

function addZoom(zoomAmount: number) {
    // Move camera towards pointer
    if (Math.abs(zoomAmount) >= 0.00001) {
        let screenPos = currentMousePos.divide(canvasSize.y);
        screenPos.y = 1 - screenPos.y;
        let zoomCenter = screenPos.sub(new vec2(canvasSize.x / canvasSize.y * 0.5, 0.5)).mult(cameraSize * 2);
        cameraPos = cameraPos.add(zoomCenter.mult(1 - (cameraSize + zoomAmount) / cameraSize));
    }
    
    cameraSize += zoomAmount;
}
