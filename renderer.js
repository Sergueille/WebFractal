"use strict";
let renderers;
class Renderer {
    constructor(name, props) {
        this.name = "";
        this.props = [];
        this.name = name;
        this.props = props;
    }
    CreateUI() {
        for (const prop of this.props) {
            paramsContainer.appendChild(prop.GetElement());
        }
    }
    SetUniforms(shader) {
        for (const prop of this.props) {
            prop.SetUniform(shader);
        }
    }
}
var ValType;
(function (ValType) {
    ValType[ValType["Int"] = 0] = "Int";
    ValType[ValType["Float"] = 1] = "Float";
    ValType[ValType["Vec2"] = 2] = "Vec2";
})(ValType || (ValType = {}));
class Prop {
    constructor(uniformName, displayName, type, def) {
        this.uniformName = uniformName;
        this.displayName = displayName;
        this.type = type;
        this.value = def;
    }
    // Get a piece of UI that change this prop
    GetElement() {
        let res;
        if (this.type == ValType.Vec2) {
            let tempalte = document.getElementById("vec2-prop");
            res = tempalte.content.cloneNode(true);
            let vec = this.value;
            res.querySelector(".prop-val-x").addEventListener("change", (ev) => {
                vec.x = +ev.target.value;
                propsChangedSinceLastFrame = true;
            });
            res.querySelector(".prop-val-x").value = vec.x.toString();
            res.querySelector(".prop-val-y").addEventListener("change", (ev) => {
                vec.y = +ev.target.value;
                propsChangedSinceLastFrame = true;
            });
            res.querySelector(".prop-val-y").value = vec.y.toString();
        }
        else if (this.type == ValType.Float || this.type == ValType.Int) {
            let tempId = this.type == ValType.Float ? "float-prop" : "int-prop";
            let tempalte = document.getElementById(tempId);
            res = tempalte.content.cloneNode(true);
            res.querySelector(".prop-val").addEventListener("change", (ev) => {
                this.value = +ev.target.value;
                propsChangedSinceLastFrame = true;
            });
            res.querySelector(".prop-val").value = this.value.toString();
        }
        else {
            throw "Unknown prop type!";
        }
        res.querySelector(".prop-name").innerHTML = this.displayName;
        return res;
    }
    // Set the uniform of a shader with the prop's values
    SetUniform(shader) {
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
            throw "Unknown prop type!";
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
        new Renderer("Mandelbulb", [
            new Prop("blb_power", "Puissance", ValType.Float, 5),
            new Prop("blb_z", "Position Z", ValType.Float, 0),
            new Prop("blb_iterations", "Nombre d'iterations", ValType.Int, 15),
        ]),
    ];
}
