const panel = document.getElementById("panel")!!;
const showPanel = document.getElementById("show-panel")!!;
const paramsContainer = document.getElementById("params")!!;
const renderSelect = document.getElementById("render-select")!! as HTMLSelectElement;
const colorInputA = document.getElementById("color-a")!! as HTMLInputElement;
const colorInputB = document.getElementById("color-b")!! as HTMLInputElement;
const colorInputC = document.getElementById("color-c")!! as HTMLInputElement;
const colorTreshold = document.getElementById("color-treshold")!! as HTMLInputElement;
let selectedRenderer = 0;
let currentRenderer: Renderer;
let currentRendererID: number;

function initUI() {
    for (let i = 0; i < renderers.length; i++) {
        let option = document.createElement("option");
        option.setAttribute("value", i.toString());
        option.innerHTML = renderers[i].name;
        renderSelect.appendChild(option);
    }

    changeRenderer(0);

    colorInputA.value = "#250850";
    colorInputB.value = "#ff0000";
    colorInputC.value = "#000000";
    colorTreshold.value = "0.95"
}

function togglePanel() {
    panel.classList.toggle("hidden")
    showPanel.classList.toggle("hidden")
}

function changeRendererEvent(ev: Event) {
    changeRenderer(+(ev!!.target!! as HTMLSelectElement).value);
}

function changeRenderer(id: number) {
    currentRenderer = renderers[id];
    currentRendererID = id;
    paramsContainer.innerHTML = "";
    renderers[id].CreateUI();
}

function UpdateUI() {
    if (shaderLoaded("quad")){
        let shader = getShader("quad");

        currentRenderer.SetUniforms(shader);
        GL.uniform3fv(getShaderUniform(shader, "colorA"), hexToRgb(colorInputA.value));
        GL.uniform3fv(getShaderUniform(shader, "colorB"), hexToRgb(colorInputB.value));
        GL.uniform3fv(getShaderUniform(shader, "colorC"), hexToRgb(colorInputC.value));
        GL.uniform1f(getShaderUniform(shader, "treshold"), +colorTreshold.value);
    }
}
