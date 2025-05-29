// Global variables
let quadPosBuffer: WebGLBuffer; // The vertex array of the main quad
let canvas: HTMLCanvasElement = document.querySelector("#canvas") as HTMLCanvasElement;
let canvasSize: vec2; // Size of the canvas, in pixels
let ratio: number; // Width of the canvas / height of the canvas
let GL: WebGLRenderingContext;

let exportInfoText = document.getElementById("export-info") as HTMLElement;

let cumulTextureA: WebGLTexture;
let cumulTextureB: WebGLTexture;
let renderTexture: WebGLTexture;
let framebuffer: WebGLFramebuffer;
let cumulBufferA: WebGLFramebuffer;
let cumulBufferB: WebGLFramebuffer;

let time: number = 0;
let deltaTime: number = 0;
let lastTime: number = 0;

let frame = 0;
let lastCamPos: vec2;
let lastCamSize: number;
let propsChangedSinceLastFrame: boolean;

let renderDuration;

let renderLoopHandle: number;

let averageDeltaTime = 0;
const fpsSlidingAverageFactor = 0.05;

CreateContext();
CreateQuad();
CreateBufferAndTextures();
initShaders();
initCamera();
CreateRenderers();

addEventListener("resize", onResize);

// Read url params
let params = new URL(window.location.href).searchParams;
LoadPropsFromURL(params.toString());

// Create UI
initUI();

function Render() {
    // Bind array buffer
    GL.bindBuffer(GL.ARRAY_BUFFER, quadPosBuffer);

    /*
    cameraPos = new vec2(Math.round(cameraPos.x * canvasSize.x / cameraSize) / canvasSize.x * cameraSize,
                         Math.round(cameraPos.y * canvasSize.y / cameraSize) / canvasSize.y * cameraSize);
    */

    let cameraWidth = cameraSize * ratio;
                         
    let renderCamPos = new vec2(
        Math.round(cameraPos.x / cameraWidth * canvasSize.x) * cameraWidth / canvasSize.x,
        Math.round(cameraPos.y / cameraSize * canvasSize.y) * cameraSize / canvasSize.y,
    );
    
    if (!lastCamPos) lastCamPos = cameraPos;
               
    let renderCamLastPos = new vec2(
        Math.round(lastCamPos.x / cameraWidth * canvasSize.x) * cameraWidth / canvasSize.x,
        Math.round(lastCamPos.y / cameraSize * canvasSize.y) * cameraSize / canvasSize.y,
    );

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
        GL.uniform2f(getShaderUniform(mainShader, "camPos"), renderCamPos.x + randomShiftX, renderCamPos.y + randomShiftY);
        GL.uniform1f(getShaderUniform(mainShader, "camSize"), cameraSize);
        GL.uniform1i(getShaderUniform(mainShader, "renderer"), currentRendererID);
        UpdateUI();

        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4);

        /////// CUMUL PASS
        useShader(blurShader);
        let shift = renderCamPos.sub(renderCamLastPos).dividev(new vec2(2 * cameraSize * canvasSize.x / canvasSize.y, 2 * cameraSize));
        console.log(shift);

        if (!propsChangedSinceLastFrame) {
            GL.uniform2f(getShaderUniform(blurShader, "shift"), shift.x, shift.y);
            GL.uniform1f(getShaderUniform(blurShader, "sizeShift"), (lastCamSize - cameraSize) / lastCamSize);
        }
        else {
            GL.uniform2f(getShaderUniform(blurShader, "shift"), 0, 0);
            GL.uniform1f(getShaderUniform(blurShader, "sizeShift"), 0);
        }

        if (frame % 2 == 0) {
            GL.bindFramebuffer(GL.FRAMEBUFFER, cumulBufferA);

            if (propsChangedSinceLastFrame)
                setTexture(blurShader, "cumul", renderTexture, 0);
            else
                setTexture(blurShader, "cumul", cumulTextureB, 0);
        }
        else {
            GL.bindFramebuffer(GL.FRAMEBUFFER, cumulBufferB);

            if (propsChangedSinceLastFrame)
                setTexture(blurShader, "cumul", renderTexture, 0);
            else
                setTexture(blurShader, "cumul", cumulTextureA, 0);
        }

        SetVertexArray(blurShader);
        setTexture(blurShader, "tex", renderTexture, 1);

        GL.drawArrays(GL.TRIANGLE_STRIP, 0, 4)

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
    if (deltaTime > 0.2) deltaTime = 0.2; // Prevent FPS drop breaking program

    Render();

    lastCamPos = cameraPos;
    lastCamSize = cameraSize;
    updateCamera();

    averageDeltaTime = deltaTime * fpsSlidingAverageFactor + averageDeltaTime * (1 - fpsSlidingAverageFactor);

    if (showFPS)
        fps.innerHTML = `${Math.round(averageDeltaTime * 1000)}ms (${Math.round(1 / averageDeltaTime)} FPS)`

    if (isShowingSlowMessage) {
        if (discardedSlowMessage) { // Fast enough
            slowMessage.classList.add("hidden")
            isShowingSlowMessage = false;
        }
    }
    else {
        if (time > 5 && deltaTime * 1000 > 150 && !discardedSlowMessage) { // Too slow
            slowMessage.classList.remove("hidden")
            isShowingSlowMessage = true;
        }
    }

    lastTime = time;
    frame++;
    
    renderLoopHandle = window.requestAnimationFrame(RenderLoop);
}

function EachSecond()
{
    window.history.replaceState(null, "", 
        `?cam=${getCameraString()}&vals=${currentRendererID},${currentRenderer.GetString()}&colors=${colorInputA.value.slice(1)},${colorInputB.value.slice(1)},${colorInputC.value.slice(1)},${colorThreshold.value}`);
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

    quadPosBuffer = GL.createBuffer()!!;
    GL.bindBuffer(GL.ARRAY_BUFFER, quadPosBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positions), GL.STATIC_DRAW);
}

function CreateContext() {
    canvasSize = new vec2(window.innerWidth, window.innerHeight);
    canvas.setAttribute("width", canvasSize.x.toString());
    canvas.setAttribute("height", canvasSize.y.toString());
    ratio = window.innerWidth / window.innerHeight;
    let glNull = canvas.getContext("webgl2", {antialias: false});

    if (!glNull)
        alert("The website can't init WebGL. Your browser or machine doesn't support it.");

    GL = glNull!!;

    GL.disable(GL.DEPTH_TEST);
}

function SetVertexArray(shader: WebGLShader) {
    GL.vertexAttribPointer(
        getShaderAttribute(shader, "vPos"),
        2, // nb components (here vec2)
        GL.FLOAT, // data type
        false, // normalize
        0, // stride (how many to skip to reach next data) here 0 is default
        0, // offset (where to start?)
    );
    GL.enableVertexAttribArray(getShaderAttribute(shader, "vPos"));
}

// Creates a new framebuffer (needed when window is resized)
function CreateBufferAndTextures() {
    // create textures
    renderTexture = CreateRenderTexture(canvasSize.x, canvasSize.y);
    cumulTextureA = CreateRenderTexture(canvasSize.x, canvasSize.y);
    cumulTextureB = CreateRenderTexture(canvasSize.x, canvasSize.y);

    framebuffer = GL.createFramebuffer()!!;
    GL.bindFramebuffer(GL.FRAMEBUFFER, framebuffer);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, renderTexture, 0);

    cumulBufferA = GL.createFramebuffer()!!;
    GL.bindFramebuffer(GL.FRAMEBUFFER, cumulBufferA);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, cumulTextureA, 0);   

    cumulBufferB = GL.createFramebuffer()!!;
    GL.bindFramebuffer(GL.FRAMEBUFFER, cumulBufferB);
    GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, cumulTextureB, 0);  

    propsChangedSinceLastFrame = true; // Make sure to render the fractal without antialiasing
}

function CreateRenderTexture(width: number, height: number): WebGLTexture {
    let texture = GL.createTexture()!!;
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
    return new Promise(() => ExportAsync());
}

async function ExportAsync() {
    let exportSize;
    const exportSizeType = +exportSizeTypeSelect.value;
    const exportCustomSize = new vec2(+exportSizeXInput.value, +exportSizeYInput.value);

    exportInfoText.innerText = "Veillez patienter...";

    await delay(200);

    if (exportSizeType === ExportSizeType.screenSize) {
        exportSize = new vec2(window.screen.width, window.screen.height);
    }
    else if (exportSizeType === ExportSizeType.windowSize) {
        exportSize = new vec2(window.innerWidth, window.innerHeight);
    }
    else {
        exportSize = exportCustomSize.abs()
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

    exportInfoText.innerText = "Terminé! Si l'exportation a échoué, essayez un nombre d'itération plus bas.";

    // Save image
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var a = document.createElement('a');
    a.href = image as string & Location;
    a.download = "fractal.png";
    a.click();

    // Reset canvas size
    onResize();
    // Resume rendering
    RenderLoop();
}

function LoadPropsFromURL(text: string) {
    let params = new URLSearchParams(text);

    let camData = params.get("cam")?.split(",");
    if (camData && camData.length == 3) {
        cameraPos.x = +camData[0];
        cameraPos.y = +camData[1];
        targetCameraSize = cameraSize = +camData[2];
    }

    let values = params.get("vals")?.split(",");
    if (values && values.length > 1) {

        let targetRendererID = +values[0];
        let targetRenderer = renderers[targetRendererID];

        for (let prop of targetRenderer.props) {
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

        changeRenderer(targetRendererID);
        renderSelect.value = values[0];
    }
    else {
        changeRenderer(0);
        renderSelect.value = "0";
    }

    let colors = params.get("colors")?.split(",");
    if (colors && colors.length == 4) {
        colorInputA.value = "#" + colors[0];
        colorInputB.value = "#" + colors[1];
        colorInputC.value = "#" + colors[2];
        colorThreshold.value = colors[3];
    }
    else {
        colorInputA.value = "#172540";
        colorInputB.value = "#1de817";
        colorInputC.value = "#051401";
        colorThreshold.value = "0.95";
    }
}
