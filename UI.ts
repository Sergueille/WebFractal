const panel = document.getElementById("panel-wrapper")!!;
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

const addBtnSpeed = 0.5; // each second
const addBtnShiftSpeed = 2; // each second
const addBtnCtrlSpeed = 0.05; // each second

let shift: boolean;
let control: boolean;

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

    document.addEventListener("keyup", UpdateKeys);
    document.addEventListener("keydown", UpdateKeys);
}

function UpdateKeys(ev: KeyboardEvent) {
    shift = ev.shiftKey;
    control = ev.ctrlKey;
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
        
        document.body.style.setProperty('--prim', colorInputB.value);
    }
}

function AddButton(ev: Event, direction: number, int: boolean) {
    let func = setInterval(() => {
        let parent = (ev.target as HTMLElement).parentElement;
        let input = parent?.querySelector("input")!!;
        let value = parseFloat(input.value);
    
        if (int) {
            value = Math.round(value);
            value += 1;
        }
        else if (shift) {
            value += addBtnShiftSpeed * deltaTime * direction;
            value = Math.round(value * 1000) / 1000;
        } 
        else if (control) {
            value += addBtnCtrlSpeed * deltaTime * direction;
            value = Math.round(value * 1000) / 1000;
        }
        else{
            value += addBtnSpeed * deltaTime * direction;
            value = Math.round(value * 1000) / 1000;
        }
    
        input.value = value.toString();
        input.dispatchEvent(new Event('change'));
    }
    , 0);

    (ev.target as HTMLElement).onmouseup = () => clearInterval(func);
    (ev.target as HTMLElement).onmouseleave = () => clearInterval(func);
}
