"use strict";
var _a, _b;
// Global variables
let quadPosBuffer; // The vertax array of the main quad
let canvas = document.querySelector("#canvas");
let canvasSize; // Size of the canvas, in pixels
let ratio; // Width of the canvas / height of the canvas
let GL;
let cumulTextureA;
let cumulTextureB;
let renderTexture;
let framebuffer;
let cumulbufferA;
let cumulbufferB;
let time = 0;
let deltaTime = 0;
let lastTime = 0;
let frame = 0;
let lastCamPos;
let lastCamSize;
let propsChangedSinceLastFrame;
let renderDuration;
let renderLoopHandle;
CreateContext();
CreateQuad();
CreateBufferAndTextures();
initShaders();
initCamera();
CreateRenderers();
addEventListener("resize", onResize);
// Read url params
let params = new URL(window.location.href).searchParams;
let camData = (_a = params.get("cam")) === null || _a === void 0 ? void 0 : _a.split(",");
if (camData) {
    cameraPos.x = +camData[0];
    cameraPos.y = +camData[1];
    targetCameraSize = cameraSize = +camData[2];
}
let values = (_b = params.get("vals")) === null || _b === void 0 ? void 0 : _b.split(",");
if (values) {
    changeRenderer(+values[0]);
    for (let prop of currentRenderer.props) {
        for (let val of values) {
            if (val.includes(prop.uniformName)) {
                let strVal = val.split(":")[1];
                if (prop.type == ValType.Vec2) {
                    prop.value.x = strVal.split("|")[0];
                    prop.value.y = strVal.split("|")[1];
                }
                else
                    prop.value = +strVal;
            }
        }
    }
}
// Create UI
initUI();
function Render() {
    // Bind array buffer
    GL.bindBuffer(GL.ARRAY_BUFFER, quadPosBuffer);
    let cameraMoved = lastCamPos != cameraPos || Math.abs(lastCamSize - cameraSize) > cameraSize * 0.0005;
    // Draw main quad
    if (shaderLoaded("main") && shaderLoaded("blur") && shaderLoaded("blit")) {
        let mainShader = getShader("main");
        let blurShader = getShader("blur");
        let blitShader = getShader("blit");
        /////// RENDER PASS
        GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);
        useShader(mainShader);
        // Randomly shift camera to create noise
        let pixelSizeX = cameraSize * ratio / canvasSize.x;
        let pixelSizeY = cameraSize / canvasSize.y;
        let randomShiftX = (Math.random() - 0.5) * pixelSizeX;
        let randomShiftY = (Math.random() - 0.5) * pixelSizeY;
        // Set uniforms
        SetVertexArray(mainShader);
        GL.uniform1f(getShaderUniform(mainShader, "ratio"), ratio);
        GL.uniform2f(getShaderUniform(mainShader, "camPos"), cameraPos.x + randomShiftX, cameraPos.y + randomShiftY);
        GL.uniform1f(getShaderUniform(mainShader, "camSize"), cameraSize);
        GL.uniform1i(getShaderUniform(mainShader, "renderer"), currentRendererID);
        UpdateUI();
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        /////// CUMUL PASS
        useShader(blurShader);
        if (frame % 2 == 0) {
            GL.bindFramebuffer(GL.FRAMEBUFFER, cumulbufferA);
            if (cameraMoved || propsChangedSinceLastFrame)
                setTexture(blurShader, "cumul", renderTexture, 0);
            else
                setTexture(blurShader, "cumul", cumulTextureB, 0);
        }
        else {
            GL.bindFramebuffer(GL.FRAMEBUFFER, cumulbufferB);
            if (cameraMoved || propsChangedSinceLastFrame)
                setTexture(blurShader, "cumul", renderTexture, 0);
            else
                setTexture(blurShader, "cumul", cumulTextureA, 0);
        }
        SetVertexArray(blurShader);
        setTexture(blurShader, "tex", renderTexture, 1);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        /////// BLIT ON RENDERBUFFER
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        useShader(blitShader);
        SetVertexArray(blitShader);
        if (frame % 2 == 0) {
            setTexture(blitShader, "tex", cumulTextureA, 0);
        }
        else {
            setTexture(blitShader, "tex", cumulTextureB, 0);
        }
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        propsChangedSinceLastFrame = false;
    }
}
function RenderLoop() {
    time = performance.now() / 1000;
    deltaTime = time - lastTime;
    if (deltaTime > 0.5)
        deltaTime = 0.5; // Prevent FPS drop breaking program
    Render();
    lastCamPos = cameraPos;
    lastCamSize = cameraSize;
    updateCamera();
    if (showFPS)
        fps.innerHTML = `${Math.round(deltaTime * 1000)}ms (${Math.round(1 / deltaTime)} FPS)`;
    if (isShowingSlowMessage) {
        if (discardedSlowMessage) { // Fast enough
            slowMessage.classList.add("hidden");
            isShowingSlowMessage = false;
        }
    }
    else {
        if (time > 5 && deltaTime * 1000 > 100 && !discardedSlowMessage) { // Too slow
            slowMessage.classList.remove("hidden");
            isShowingSlowMessage = true;
        }
    }
    lastTime = time;
    frame++;
    renderLoopHandle = window.requestAnimationFrame(RenderLoop);
}
function EachSecond() {
    window.history.replaceState(null, "", `?cam=${getCamraString()}&vals=${currentRendererID},${currentRenderer.GetString()}`);
}
RenderLoop();
setInterval(EachSecond, 2000);
function CreateQuad() {
    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ];
    quadPosBuffer = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, quadPosBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positions), GL.STATIC_DRAW);
}
function CreateContext() {
    canvasSize = new vec2(window.innerWidth, window.innerHeight);
    canvas.setAttribute("width", canvasSize.x.toString());
    canvas.setAttribute("height", canvasSize.y.toString());
    ratio = window.innerWidth / window.innerHeight;
    let glnull = canvas.getContext("webgl2", { antialias: false });
    if (!glnull)
        alert("The website can't init WebGL. Your browser or machine doesn't support it.");
    GL = glnull;
    GL.disable(GL.DEPTH_TEST);
}
function SetVertexArray(shader) {
    GL.vertexAttribPointer(getShaderAttribute(shader, "vPos"), 2, // nb components (here vec2)
    GL.FLOAT, // data type
    false, // normalize
    0, // strinde (how many to skip to reach next data) here 0 is default
    0);
    GL.enableVertexAttribArray(getShaderAttribute(shader, "vPos"));
}
// Creates a new framebuffer (needed wher window is resized)
function CreateBufferAndTextures() {
    // create textures
    renderTexture = CreateRenderTexture(canvasSize.x, canvasSize.y);
    cumulTextureA = CreateRenderTexture(canvasSize.x, canvasSize.y);
    cumulTextureB = CreateRenderTexture(canvasSize.x, canvasSize.y);
    framebuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, renderTexture, 0);
    cumulbufferA = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, cumulbufferA);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, cumulTextureA, 0);
    cumulbufferB = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, cumulbufferB);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, cumulTextureB, 0);
    propsChangedSinceLastFrame = true; // Make sure to render the fractal without antialiasing
}
function CreateRenderTexture(width, height) {
    let texture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, texture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, width, height, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
    // Set filtering
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    return texture;
}
function onResize() {
    canvasSize = new vec2(window.innerWidth, window.innerHeight);
    canvas.setAttribute("width", canvasSize.x.toString());
    canvas.setAttribute("height", canvasSize.y.toString());
    ratio = window.innerWidth / window.innerHeight;
    CreateBufferAndTextures();
    GL.viewport(0, 0, canvas.width, canvas.height);
}
function Export() {
    let exportSize;
    const exportSizeType = +exportSizeTypeSelect.value;
    const exportCustomSize = new vec2(+exportSizeXInput.value, +exportSizeYInput.value);
    if (exportSizeType === ExportSizeType.screenSize) {
        exportSize = new vec2(window.screen.width, window.screen.height);
    }
    else if (exportSizeType === ExportSizeType.windowSize) {
        exportSize = new vec2(window.innerWidth, window.innerHeight);
    }
    else {
        exportSize = exportCustomSize.abs();
    }
    // Stop rendering
    window.cancelAnimationFrame(renderLoopHandle);
    // Apply custom size
    canvasSize = new vec2(exportSize.x, exportSize.y);
    canvas.setAttribute("width", exportSize.x.toString());
    canvas.setAttribute("height", exportSize.y.toString());
    ratio = exportSize.x / exportSize.y;
    GL.viewport(0, 0, canvas.width, canvas.height);
    CreateBufferAndTextures();
    // Re-draw scene many times to remove noise
    for (let i = 0; i < 100; i++) {
        Render();
        frame++;
    }
    // Save image
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var a = document.createElement('a');
    a.href = image;
    a.download = "fractal.png";
    a.click();
    // Reset canvas size
    onResize();
    // Resume rendering
    RenderLoop();
}
