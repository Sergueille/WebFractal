const panelWrapper = document.getElementById("panel-wrapper")!!;
const panel = document.getElementById("main-panel")!!;
const showPanel = document.getElementById("show-panel")!!;
const paramsContainer = document.getElementById("params")!!;
const renderSelect = document.getElementById("render-select")!! as HTMLSelectElement;
const colorInputA = document.getElementById("color-a")!! as HTMLInputElement;
const colorInputB = document.getElementById("color-b")!! as HTMLInputElement;
const colorInputC = document.getElementById("color-c")!! as HTMLInputElement;
const colorThreshold = document.getElementById("color-treshold")!! as HTMLInputElement;
const exportSizeTypeSelect = document.getElementById("export-size-type") as HTMLSelectElement;
const exportSizeXInput = document.getElementById("export-size-x") as HTMLInputElement;
const exportSizeYInput = document.getElementById("export-size-y") as HTMLInputElement;
const fps = document.getElementById("fps") as HTMLInputElement;
const slowMessage = document.getElementById("slow-message") as HTMLElement;

let selectedRenderer = 0;
let currentRenderer: Renderer;
let currentRendererID: number;

const addBtnSpeed = 0.5; // each second
const addBtnShiftSpeed = 2; // each second
const addBtnCtrlSpeed = 0.05; // each second

let shift: boolean;
let control: boolean;

const innerPanels : { [id: string] : HTMLElement; } = {};
let currentSubPanel : HTMLElement | null = null;

let showFPS = false;

let isShowingSlowMessage = false;
let discardedSlowMessage = false;

enum ExportSizeType {
    screenSize,
    windowSize,
    customSize
}

function initUI() {
    for (let i = 0; i < renderers.length; i++) {
        let option = document.createElement("option");
        option.setAttribute("value", i.toString());
        option.innerHTML = renderers[i].name;
        renderSelect.appendChild(option);
    }

    renderSelect.value = currentRendererID.toString();

    document.addEventListener("keyup", UpdateKeys);
    document.addEventListener("keydown", UpdateKeys);

    for (let child of panel.children) {
        innerPanels[child.id] = child as HTMLElement;
        innerPanels[child.id].style.opacity = "0";
        innerPanels[child.id].style.left = "100%";
        SetFocus(innerPanels[child.id], false);
    }

    OpenSubPanel("props-panel");
    HideExportCustomSize();

    setTimeout(() => {
        document.getElementById("panel-wrapper")?.classList.add("animate");
    }, 10);
}

function UpdateKeys(ev: KeyboardEvent) {
    shift = ev.shiftKey;
    control = ev.ctrlKey;
}

function togglePanel() {
    panelWrapper.classList.toggle("hidden")
    showPanel.classList.toggle("hidden")
}

function changeRendererEvent(ev: Event) {
    changeRenderer(+(ev!!.target!! as HTMLSelectElement).value);
    propsChangedSinceLastFrame = true;
}

function changeRenderer(id: number) {
    currentRenderer = renderers[id];
    currentRendererID = id;
    paramsContainer.innerHTML = "";
    renderers[id].CreateUI();
}

function UpdateUI() {
    if (shaderLoaded("main")){
        let shader = getShader("main");

        currentRenderer.SetUniforms(shader);
        GL.uniform3fv(getShaderUniform(shader, "colorA"), hexToRgb(colorInputA.value));
        GL.uniform3fv(getShaderUniform(shader, "colorB"), hexToRgb(colorInputB.value));
        GL.uniform3fv(getShaderUniform(shader, "colorC"), hexToRgb(colorInputC.value));
        GL.uniform1f(getShaderUniform(shader, "treshold"), +colorThreshold.value);
        
        document.body.style.setProperty('--prim', colorInputB.value);
    }
    
    panel.style.setProperty("height", currentSubPanel?.clientHeight + "px");
}

function AddButton(ev: Event, direction: number, int: boolean) {
    let func = setInterval(() => {
        let parent = (ev.target as HTMLElement).parentElement;
        let input = parent?.querySelector("input")!!;
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
        else{
            value += addBtnSpeed * deltaTime * direction;
            value = Math.round(value * 1000) / 1000;
        }

        propsChangedSinceLastFrame = true;
    
        input.value = value.toString();
        input.dispatchEvent(new Event('change'));
    }
    , 0);

    (ev.target as HTMLElement).onmouseup = () => clearInterval(func);
    (ev.target as HTMLElement).onmouseleave = () => clearInterval(func);

    (ev.target as HTMLElement).ontouchend = () => clearInterval(func);
}

function OpenSubPanel(id : string) {
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

function SetFocus(element: Element, focusEnabled: boolean) {
    if (focusEnabled)
        element.removeAttribute("tabindex");
    else
        element.setAttribute("tabindex", "-1");

    for (let child of element.children) {
        SetFocus(child, focusEnabled);
    }    
}
