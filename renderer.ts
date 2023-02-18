let renderers: Array<Renderer>;

class Renderer {
    public name: string = "";
    public props: Array<Prop<any>> = [];

    constructor(name: string, props: Array<Prop<any>>) {
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

class Prop<T> {
    public uniformName: string;
    public displayName: string;
    public value: T;

    constructor(uniformName: string, displayName: string, def: T) {
        this.uniformName = uniformName;
        this.displayName = displayName;
        this.value = def;
    }

    // Get a piece of UI that change this prop
    public GetElement(): HTMLElement {
        let res: HTMLElement;

        if (this.value instanceof vec2) {
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
        else if (this instanceof Prop<number>) {
            let tempalte = document.getElementById("float-prop")!! as HTMLTemplateElement;
            res = tempalte.content.cloneNode(true) as HTMLElement;

            let thisInt = this as unknown as Prop<number>;
            res.querySelector(".prop-val")!!.addEventListener("change", (ev: Event) => {
                thisInt.value = +(ev!!.target!! as HTMLInputElement).value;
                propsChangedSinceLastFrame = true;
            });
            (res.querySelector(".prop-val")!! as HTMLInputElement).value =  thisInt.value.toString();
        }
        else {
            throw "Unknown prop type!"
        }

        res.querySelector(".prop-name")!!.innerHTML = this.displayName;

        return res;
    }

    // Set the uniform of a shader with the prop's values
    public SetUniform(shader: WebGLShader) {
        if (this.value instanceof vec2) {
            GL.uniform2f(getShaderUniform(shader, this.uniformName), this.value.x, this.value.y);
        }
        else if (this instanceof Prop<number>) {
            let thisInt = this as unknown as Prop<number>;
            GL.uniform1f(getShaderUniform(shader, this.uniformName), thisInt.value);
        }
        else {
            throw "Unknown prop type!"
        }
    }
}

function CreateRenderers() {
    renderers = [
        new Renderer("Mandelbrot", [
            new Prop<vec2>("mdb_val", "Valeur de départ (Z<sub>0</sub>)", new vec2(0)),
            new Prop<number>("mdb_offset", "Multiplicateur", 2),
            new Prop<number>("mdb_iterations", "Nombre d'iterations", 400),
        ]),
        new Renderer("Julia", [
            new Prop<vec2>("mdb_val", "Constante C", new vec2(0.15, 0.6)),
            new Prop<number>("mdb_offset", "Multiplicateur", 2),
            new Prop<number>("mdb_iterations", "Nombre d'iterations", 400),
        ]),
        new Renderer("Burning ship", [
            new Prop<vec2>("mdb_val", "Valeur de départ (Z<sub>0</sub>)", new vec2(0)),
            new Prop<number>("mdb_offset", "Multiplicateur", 2),
            new Prop<number>("mdb_iterations", "Nombre d'iterations", 400),
        ]),
        new Renderer("Mandelbulb", [
            new Prop<number>("blb_power", "Puissance", 5),
            new Prop<number>("blb_z", "Position Z", 0),
            new Prop<number>("blb_iterations", "Nombre d'iterations", 15),
        ]),
    ]
}

