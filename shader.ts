const SHADERS: { [id: string] : WebGLShader; } = {}

function initShaders() {
    createShaderFromFile("quadVtex.glsl", "quadFrag.glsl", "quad")
}

function useShader(shader: WebGLShader): WebGLShader {
    GL.useProgram(shader);
    return shader;
}

function shaderLoaded(shaderName: string): boolean {
    let res = SHADERS[shaderName];

    if (!res) return false;
    else return true;
}

function getShaderAttribute(shader: WebGLShader, attribName: string): number {
    let res = GL.getAttribLocation(shader, attribName);

    if (res == -1)
        console.error(`Shader attribute '${attribName}' not found! Do you want to search for an uniform instead?`)

    return res;
}

function getShaderUniform(shader: WebGLShader, uniformName: string): WebGLUniformLocation | null {
    let res = GL.getUniformLocation(shader, uniformName);

    if (!res)
        console.error(`Shader uniform '${uniformName}' not found!`);

    return res;
}

function getShader(shaderName: string) {
    let res = SHADERS[shaderName];

    if (!res) {
        console.log(`Trying to get shader '${shaderName}' but was not found`)
    }

    return res;
}

async function createShaderFromFile(vFile: string, fFile: string, shaderName: string) {
    let vResponse = await fetch(vFile)
    let vText = await vResponse.text();

    let fResponse = await fetch(fFile)
    let fText = await fResponse.text();

    if (!vText || !fText) {
        console.error(`Couldn't load shader sources at ${vFile} and ${fFile}`);
        return;
    }

    let newShader = createShaderFromSource(vText, fText);
    if (newShader != null)
        SHADERS[shaderName] = newShader;

    return newShader;
}

// Compiles a shader program from source
function createShaderFromSource(vSource: string, fSource: string): WebGLShader | null {
    const vertexShader = loadShader(GL.VERTEX_SHADER, vSource);
    const fragmentShader = loadShader(GL.FRAGMENT_SHADER, fSource);

    if (!vertexShader || !fragmentShader)
        return null;

    const shaderProgram = GL.createProgram()!!;
    GL.attachShader(shaderProgram, vertexShader);
    GL.attachShader(shaderProgram, fragmentShader);
    GL.linkProgram(shaderProgram);

    if (!GL.getProgramParameter(shaderProgram, GL.LINK_STATUS)) {
        console.error("Couldn't init shader program: " + GL.getProgramInfoLog(shaderProgram));
        return null;
    }
    
    return shaderProgram;
}


// Compiles a single shader
function loadShader(type: number, source: string): WebGLShader | null {
    const shader = GL.createShader(type)!!;
  
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
  
    // Vérifier s'il a ét compilé avec succès
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        console.error("Couldn't compile shader: \n" + GL.getShaderInfoLog(shader));
        GL.deleteShader(shader);
        return null;
    }
  
    return shader;
}
