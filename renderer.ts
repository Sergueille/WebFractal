let renderers: Array<Renderer>;

class Renderer {
    public name: string = "";
    public props: Array<Prop> = [];

    constructor(name: string, props: Array<Prop>) {
        this.name = name;
        this.props = props;
    }

    public CreateUI() {
        for (const prop of this.props) {
            paramsContainer.appendChild(prop.GetElement());
        }
    }

    public SetUniforms(shader: WebGLShader) {
        for (const prop of this.props) {
            prop.SetUniform(shader);
        }
    }
}

enum ValType {
    Int,
    Float,
    Vec2,
}

class Prop {
    public uniformName: string;
    public displayName: string;
    public type: ValType; 
    public value: any;

    constructor(uniformName: string, displayName: string, type: ValType, def: any) {
        this.uniformName = uniformName;
        this.displayName = displayName;
        this.type = type;
        this.value = def;
    }

    // Get a piece of UI that change this prop
    public GetElement(): HTMLElement {
        let res: HTMLElement;

        if (this.type == ValType.Vec2) {
            let tempalte = document.getElementById("vec2-prop")!! as HTMLTemplateElement;
            res = tempalte.content.cloneNode(true) as HTMLElement;

            let vec = this.value as vec2;
            res.querySelector(".prop-val-x")!!.addEventListener("change", (ev: Event) => {
                vec.x = +(ev!!.target!! as HTMLInputElement).value;
                propsChangedSinceLastFrame = true;
            });
            (res.querySelector(".prop-val-x")!! as HTMLInputElement).value = vec.x.toString();
            res.querySelector(".prop-val-y")!!.addEventListener("change", (ev: Event) => {
                vec.y = +(ev!!.target!! as HTMLInputElement).value;
                propsChangedSinceLastFrame = true;
            });
            (res.querySelector(".prop-val-y")!! as HTMLInputElement).value = vec.y.toString();
        }
        else if (this.type == ValType.Float || this.type == ValType.Int) {
            let tempId = this.type == ValType.Float ? "float-prop" : "int-prop";
            let tempalte = document.getElementById(tempId)!! as HTMLTemplateElement;
            res = tempalte.content.cloneNode(true) as HTMLElement;

            res.querySelector(".prop-val")!!.addEventListener("change", (ev: Event) => {
                this.value = +(ev!!.target!! as HTMLInputElement).value;
                propsChangedSinceLastFrame = true;
            });
            (res.querySelector(".prop-val")!! as HTMLInputElement).value = this.value.toString();
        }
        else {
            throw "Unknown prop type!"
        }

        res.querySelector(".prop-name")!!.innerHTML = this.displayName;

        return res;
    }

    // Set the uniform of a shader with the prop's values
    public SetUniform(shader: WebGLShader) {
        if (this.type == ValType.Vec2) {
            GL.uniform2f(getShaderUniform(shader, this.uniformName), this.value.x, this.value.y);
        }
        else if (this.type == ValType.Float) {
            GL.uniform1f(getShaderUniform(shader, this.uniformName), this.value);
        }
        else if (this.type == ValType.Int) {
            GL.uniform1f(getShaderUniform(shader, this.uniformName), this.value);
        }
        else {
            throw "Unknown prop type!"
        }
    }
}

function CreateRenderers() {
    renderers = [
        new Renderer("Mandelbrot", [
            new Prop("mdb_val", "Valeur de départ (Z<sub>0</sub>)", ValType.Vec2, new vec2(0)),
            new Prop("mdb_offset", "Multiplicateur", ValType.Float, 2),
            new Prop("mdb_iterations", "Nombre d'iterations", ValType.Int, 400),
        ]),
        new Renderer("Julia", [
            new Prop("mdb_val", "Constante C", ValType.Vec2, new vec2(0.15, 0.6)),
            new Prop("mdb_offset", "Multiplicateur", ValType.Float, 2),
            new Prop("mdb_iterations", "Nombre d'iterations", ValType.Int, 400),
        ]),
        new Renderer("Burning ship", [
            new Prop("mdb_val", "Valeur de départ (Z<sub>0</sub>)", ValType.Vec2, new vec2(0)),
            new Prop("mdb_offset", "Multiplicateur", ValType.Float, 2),
            new Prop("mdb_iterations", "Nombre d'iterations", ValType.Int, 400),
        ]),
        new Renderer("Mandelbrot modifié", [
            new Prop("mdb_val", "Valeur de départ (Z<sub>0</sub>)", ValType.Vec2, new vec2(0)),
            new Prop("mdb_offset", "Multiplicateur", ValType.Float, 2),
            new Prop("mdb_delta", "δ", ValType.Float, -0.33),
            new Prop("mdb_iterations", "Nombre d'iterations", ValType.Int, 400),
        ]),
        new Renderer("Mandelbulb", [
            new Prop("blb_power", "Puissance", ValType.Float, 5),
            new Prop("blb_z", "Position Z", ValType.Float, 0),
            new Prop("blb_iterations", "Nombre d'iterations", ValType.Int, 15),
        ]),
    ]
}

