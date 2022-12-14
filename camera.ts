let isDragging: boolean; // Is the user moving the 2d view?
let lastMousePos: vec2; // Last drag position
let lastTouchDistance: number; // Lastdistance between touches (for zoom)
let lastTouchCount: number;

let cameraPos: vec2 = new vec2(0); // position of the camera
let cameraSize: number = 1; // sizo of the camera (its height)
let targetCameraSize: number = 1; // the size that the camera shold have without smoothing
let shouldSmoothCamera = false;
let cameraTargetPos: vec2;

const scrollSensibility: number = 0.1;
const scrollSmooth: number = 0.05;
const cameraSmooth: number = 0.2;

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

function onMouseDown(ev: MouseEvent) {
    isDragging = true;
    lastMousePos = new vec2(ev.clientX, ev.clientY);
    shouldSmoothCamera = false;
}

function onTouchStart(ev: TouchEvent) {
    isDragging = true;
    lastMousePos = new vec2(ev.touches[0].clientX, ev.touches[0].clientY);
    shouldSmoothCamera = false;

    if (ev.touches.length === 2) {
        let touch0Pos = new vec2(ev.touches[0].clientX, ev.touches[0].clientY);
        let touch1Pos = new vec2(ev.touches[1].clientX, ev.touches[1].clientY);
        lastTouchDistance = touch1Pos.sub(touch0Pos).len();
    }
}

function onMouseMove(ev: MouseEvent) {
    if (isDragging) {
        let newPos = new vec2(ev.clientX, ev.clientY);
        let delta = newPos.sub(lastMousePos).divide(canvasSize.y).mult(cameraSize * 2);
        delta.x *= -1;
        cameraPos = cameraPos.add(delta);

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

            targetCameraSize *= lastTouchDistance / dist;
            cameraSize = targetCameraSize;

            lastTouchDistance = dist;
        }
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
