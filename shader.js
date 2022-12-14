"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const SHADERS = {};
function initShaders() {
    createShaderFromFile("quadVtex.glsl", "quadFrag.glsl", "quad");
}
function useShader(shader) {
    GL.useProgram(shader);
    return shader;
}
function shaderLoaded(shaderName) {
    let res = SHADERS[shaderName];
    if (!res)
        return false;
    else
        return true;
}
function getShaderAttribute(shader, attribName) {
    let res = GL.getAttribLocation(shader, attribName);
    if (res == -1)
        console.error(`Shader attribute '${attribName}' not found! Do you want to search for an uniform instead?`);
    return res;
}
function getShaderUniform(shader, uniformName) {
    let res = GL.getUniformLocation(shader, uniformName);
    if (!res)
        console.error(`Shader uniform '${uniformName}' not found!`);
    return res;
}
function getShader(shaderName) {
    let res = SHADERS[shaderName];
    if (!res) {
        console.log(`Trying to get shader '${shaderName}' but was not found`);
    }
    return res;
}
function createShaderFromFile(vFile, fFile, shaderName) {
    return __awaiter(this, void 0, void 0, function* () {
        let vResponse = yield fetch(vFile);
        let vText = yield vResponse.text();
        let fResponse = yield fetch(fFile);
        let fText = yield fResponse.text();
        if (!vText || !fText) {
            console.error(`Couldn't load shader sources at ${vFile} and ${fFile}`);
            return;
        }
        let newShader = createShaderFromSource(vText, fText);
        if (newShader != null)
            SHADERS[shaderName] = newShader;
        return newShader;
    });
}
// Compiles a shader program from source
function createShaderFromSource(vSource, fSource) {
    const vertexShader = loadShader(GL.VERTEX_SHADER, vSource);
    const fragmentShader = loadShader(GL.FRAGMENT_SHADER, fSource);
    if (!vertexShader || !fragmentShader)
        return null;
    const shaderProgram = GL.createProgram();
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
function loadShader(type, source) {
    const shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    // V??rifier s'il a ??t compil?? avec succ??s
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        console.error("Couldn't compile shader: \n" + GL.getShaderInfoLog(shader));
        GL.deleteShader(shader);
        return null;
    }
    return shader;
}
