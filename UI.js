"use strict";
const panelWrapper = document.getElementById("panel-wrapper");
const panel = document.getElementById("main-panel");
const showPanel = document.getElementById("show-panel");
const paramsContainer = document.getElementById("params");
const renderSelect = document.getElementById("render-select");
const colorInputA = document.getElementById("color-a");
const colorInputB = document.getElementById("color-b");
const colorInputC = document.getElementById("color-c");
const colorTreshold = document.getElementById("color-treshold");
const exportSizeTypeSelect = document.getElementById("export-size-type");
const exportSizeXInput = document.getElementById("export-size-x");
const exportSizeYInput = document.getElementById("export-size-y");
const fps = document.getElementById("fps");
const slowMessage = document.getElementById("slow-message");
let selectedRenderer = 0;
let currentRenderer;
let currentRendererID;
const addBtnSpeed = 0.5; // each second
const addBtnShiftSpeed = 2; // each second
const addBtnCtrlSpeed = 0.05; // each second
let shift;
let control;
const innerPanels = {};
let currentSubPanel = null;
let showFPS = false;
let isShowingSlowMessage = false;
let discardedSlowMessage = false;
var ExportSizeType;
(function (ExportSizeType) {
    ExportSizeType[ExportSizeType["screenSize"] = 0] = "screenSize";
    ExportSizeType[ExportSizeType["windowSize"] = 1] = "windowSize";
    ExportSizeType[ExportSizeType["customSize"] = 2] = "customSize";
})(ExportSizeType || (ExportSizeType = {}));
// TODO: set renderSelect on startup
function initUI() {
    for (let i = 0; i < renderers.length; i++) {
        let option = document.createElement("option");
        option.setAttribute("value", i.toString());
        option.innerHTML = renderers[i].name;
        renderSelect.appendChild(option);
    }
    changeRenderer(0);
    renderSelect.value = "0";
    colorInputA.value = "#161741";
    colorInputB.value = "#ff0000";
    colorInputC.value = "#000000";
    colorTreshold.value = "0.95";
    document.addEventListener("keyup", UpdateKeys);
    document.addEventListener("keydown", UpdateKeys);
    for (let child of panel.children) {
        innerPanels[child.id] = child;
        innerPanels[child.id].style.opacity = "0";
        innerPanels[child.id].style.left = "100%";
        SetFocus(innerPanels[child.id], false);
    }
    OpenSubPanel("props-panel");
    HideExportCustomSize();
}
function UpdateKeys(ev) {
    shift = ev.shiftKey;
    control = ev.ctrlKey;
}
function togglePanel() {
    panelWrapper.classList.toggle("hidden");
    showPanel.classList.toggle("hidden");
}
function changeRendererEvent(ev) {
    changeRenderer(+ev.target.value);
    propsChangedSinceLastFrame = true;
}
function changeRenderer(id) {
    currentRenderer = renderers[id];
    currentRendererID = id;
    paramsContainer.innerHTML = "";
    renderers[id].CreateUI();
}
function UpdateUI() {
    if (shaderLoaded("main")) {
        let shader = getShader("main");
        currentRenderer.SetUniforms(shader);
        GL.uniform3fv(getShaderUniform(shader, "colorA"), hexToRgb(colorInputA.value));
        GL.uniform3fv(getShaderUniform(shader, "colorB"), hexToRgb(colorInputB.value));
        GL.uniform3fv(getShaderUniform(shader, "colorC"), hexToRgb(colorInputC.value));
        GL.uniform1f(getShaderUniform(shader, "treshold"), +colorTreshold.value);
        document.body.style.setProperty('--prim', colorInputB.value);
    }
    panel.style.setProperty("height", (currentSubPanel === null || currentSubPanel === void 0 ? void 0 : currentSubPanel.clientHeight) + "px");
}
function AddButton(ev, direction, int) {
    let func = setInterval(() => {
        let parent = ev.target.parentElement;
        let input = parent === null || parent === void 0 ? void 0 : parent.querySelector("input");
        let value = parseFloat(input.value);
        if (int) {
            value = Math.round(value);
            value += direction;
        }
        else if (shift) {
            value += addBtnShiftSpeed * deltaTime * direction;
            value = Math.round(value * 1000) / 1000;
        }
        else if (control) {
            value += addBtnCtrlSpeed * deltaTime * direction;
            value = Math.round(value * 1000) / 1000;
        }
        else {
            value += addBtnSpeed * deltaTime * direction;
            value = Math.round(value * 1000) / 1000;
        }
        propsChangedSinceLastFrame = true;
        input.value = value.toString();
        input.dispatchEvent(new Event('change'));
    }, 0);
    ev.target.onmouseup = () => clearInterval(func);
    ev.target.onmouseleave = () => clearInterval(func);
    ev.target.ontouchend = () => clearInterval(func);
}
function OpenSubPanel(id) {
    if (currentSubPanel != null) {
        currentSubPanel.style.opacity = "0";
        if (currentSubPanel.id === "props-panel") {
            currentSubPanel.style.left = "-100%";
            currentSubPanel.style.right = "100%";
        }
        else {
            currentSubPanel.style.left = "100%";
            currentSubPanel.style.right = "-100%";
        }
        SetFocus(currentSubPanel, false);
    }
    innerPanels[id].style.opacity = "1";
    innerPanels[id].style.left = "0";
    innerPanels[id].style.right = "0";
    SetFocus(innerPanels[id], true);
    currentSubPanel = innerPanels[id];
}
function HideExportCustomSize() {
    const exportSizeType = +exportSizeTypeSelect.value;
    if (exportSizeType === ExportSizeType.customSize) {
        if (exportSizeXInput.parentElement)
            exportSizeXInput.parentElement.style.display = "flex";
        if (exportSizeYInput.parentElement)
            exportSizeYInput.parentElement.style.display = "flex";
    }
    else {
        if (exportSizeXInput.parentElement)
            exportSizeXInput.parentElement.style.display = "none";
        if (exportSizeYInput.parentElement)
            exportSizeYInput.parentElement.style.display = "none";
    }
}
function ToggleFPS() {
    showFPS = !showFPS;
    fps.classList.toggle("hidden");
}
function SetFocus(element, focusEnabled) {
    if (focusEnabled)
        element.removeAttribute("tabindex");
    else
        element.setAttribute("tabindex", "-1");
    for (let child of element.children) {
        SetFocus(child, focusEnabled);
    }
}
