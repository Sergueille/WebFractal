"use strict";
// Global variables
let quadPosBuffer; // The vertax array of the main quad
let canvas = document.querySelector("#canvas");
let canvasSize; // Size of the canvas, in pixels
let ratio; // Width of the canvas / height of the canvas
let GL;
let renderTexture;
let framebuffer; // Intermediate framebuffer
let time = 0;
let deltaTime = 0;
let lastTime = 0;
CreateContext();
CreateQuad();
UpdateFrameBuffer();
initShaders();
initCamera();
CreateRenderers();
initUI();
addEventListener("resize", onResize);
function mainLoop() {
    time = performance.now() / 1000;
    deltaTime = time - lastTime;
    if (deltaTime > 0.5)
        deltaTime = 0.5; // Prevent FPS drop breaking program
    // Clear viewport
    GL.clearColor(0.2, 0.0, 0.0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT);
    // Bind array buffer
    GL.bindBuffer(GL.ARRAY_BUFFER, quadPosBuffer);
    // Draw main quad
    if (shaderLoaded("main") && shaderLoaded("blur")) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer); // Intermediate framebuffer
        let mainShader = useShader(getShader("main"));
        // Send vertex data to shader
        GL.vertexAttribPointer(getShaderAttribute(mainShader, "vPos"), 2, // nb components (here vec2)
        GL.FLOAT, // data type
        false, // normalize
        0, // strinde (how many to skip to reach next data) here 0 is default
        0);
        GL.enableVertexAttribArray(getShaderAttribute(mainShader, "vPos"));
        // Set uniforms
        GL.uniform1f(getShaderUniform(mainShader, "ratio"), ratio);
        GL.uniform2f(getShaderUniform(mainShader, "camPos"), cameraPos.x, cameraPos.y);
        GL.uniform1f(getShaderUniform(mainShader, "camSize"), cameraSize);
        GL.uniform1i(getShaderUniform(mainShader, "renderer"), currentRendererID);
        UpdateUI();
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null); // Final framebuffer
        let blurShader = useShader(getShader("blur"));
        // Send vertex data to shader
        GL.vertexAttribPointer(getShaderAttribute(blurShader, "vPos"), 2, // nb components (here vec2)
        GL.FLOAT, // data type
        false, // normalize
        0, // strinde (how many to skip to reach next data) here 0 is default
        0);
        GL.enableVertexAttribArray(getShaderAttribute(blurShader, "vPos"));
        GL.uniform1f(getShaderUniform(blurShader, "ratio"), 1);
        GL.uniform2f(getShaderUniform(blurShader, "camPos"), 0.5, 0.5);
        GL.uniform1f(getShaderUniform(blurShader, "camSize"), 0.5);
        GL.bindTexture(GL.TEXTURE_2D, renderTexture);
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    }
    updateCamera();
    if (showFPS)
        fps.innerHTML = `${Math.round(deltaTime * 1000)}ms (${Math.round(1 / deltaTime)} FPS)`;
    lastTime = time;
    window.requestAnimationFrame(mainLoop);
}
mainLoop();
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
// Creates a new framebuffer (needed wher window is resized)
function UpdateFrameBuffer() {
    framebuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);
    // attach the render texture
    CreateRenderTexture(window.innerWidth, window.innerHeight);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, renderTexture, 0);
}
function CreateRenderTexture(width, height) {
    renderTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, renderTexture);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, width, height, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
    // Set filtering
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
}
function onResize() {
    canvasSize = new vec2(window.innerWidth, window.innerHeight);
    canvas.setAttribute("width", canvasSize.x.toString());
    canvas.setAttribute("height", canvasSize.y.toString());
    ratio = window.innerWidth / window.innerHeight;
    UpdateFrameBuffer();
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
    // Apply custom size
    canvas.setAttribute("width", exportSize.x.toString());
    canvas.setAttribute("height", exportSize.y.toString());
    ratio = exportSize.x / exportSize.y;
    GL.viewport(0, 0, canvas.width, canvas.height);
    // Re-draw scene
    mainLoop();
    // Save image
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var a = document.createElement('a');
    a.href = image;
    a.download = "fractal.png";
    a.click();
    // Reset canvas size
    onResize();
}
