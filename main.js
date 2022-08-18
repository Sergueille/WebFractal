"use strict";
// Global variables
let quadPosBuffer; // The vertax array of the main quad
let canvas = document.querySelector("#canvas");
let canvasSize; // Size of the canvas, in pixels
let ratio; // Width of the canvas / height of the canvas
let GL;
let time = 0;
let deltaTime = 0;
let lastTime = 0;
CreateContext();
CreateQuad();
initShaders();
initCamera();
CreateRenderers();
initUI();
addEventListener("resize", onResize);
function mainLoop() {
    time = Date.now() / 1000;
    deltaTime = time - lastTime;
    if (deltaTime > 1)
        deltaTime = 1; // Prevent FPS drop breaking program
    // Clear viewport
    GL.clearColor(0.2, 0.0, 0.0, 1.0);
    GL.clear(GL.COLOR_BUFFER_BIT);
    // Draw main quad
    if (shaderLoaded("quad")) {
        let shader = useShader(getShader("quad"));
        GL.bindBuffer(GL.ARRAY_BUFFER, quadPosBuffer);
        GL.vertexAttribPointer(getShaderAttribute(shader, "vPos"), 2, // nb components (here vec2)
        GL.FLOAT, // data type
        false, // normalize
        0, // strinde (how many to skip to reach next data) here 0 is default
        0);
        // Set uniforms
        GL.uniform1f(getShaderUniform(shader, "ratio"), ratio);
        GL.uniform2f(getShaderUniform(shader, "camPos"), cameraPos.x, cameraPos.y);
        GL.uniform1f(getShaderUniform(shader, "camSize"), cameraSize);
        GL.uniform1i(getShaderUniform(shader, "renderer"), currentRendererID);
        UpdateUI();
        GL.enableVertexAttribArray(getShaderAttribute(shader, "vPos"));
        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);
    }
    updateCamera();
    lastTime = time;
    setTimeout(mainLoop, 0);
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
    let glnull = canvas.getContext("webgl");
    if (!glnull)
        alert("The website can't init WebGL. Your browser or machine doesn't support it.");
    GL = glnull;
    GL.disable(GL.DEPTH_TEST);
}
function onResize() {
    canvasSize = new vec2(window.innerWidth, window.innerHeight);
    canvas.setAttribute("width", canvasSize.x.toString());
    canvas.setAttribute("height", canvasSize.y.toString());
    ratio = window.innerWidth / window.innerHeight;
    GL.viewport(0, 0, canvas.width, canvas.height);
}
