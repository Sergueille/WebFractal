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
class Prop {
    constructor(uniformName, displayName, def) {
        this.uniformName = uniformName;
        this.displayName = displayName;
        this.value = def;
    }
    // Get a piece of UI that change this prop
    GetElement() {
        let res;
        if (this.value instanceof vec2) {
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
        else if (this instanceof (Prop)) {
            let tempalte = document.getElementById("float-prop");
            res = tempalte.content.cloneNode(true);
            let thisInt = this;
            res.querySelector(".prop-val").addEventListener("change", (ev) => {
                thisInt.value = +ev.target.value;
                propsChangedSinceLastFrame = true;
            });
            res.querySelector(".prop-val").value = thisInt.value.toString();
        }
        else {
            throw "Unknown prop type!";
        }
        res.querySelector(".prop-name").innerHTML = this.displayName;
        return res;
    }
    // Set the uniform of a shader with the prop's values
    SetUniform(shader) {
        if (this.value instanceof vec2) {
            GL.uniform2f(getShaderUniform(shader, this.uniformName), this.value.x, this.value.y);
        }
        else if (this instanceof (Prop)) {
            let thisInt = this;
            GL.uniform1f(getShaderUniform(shader, this.uniformName), thisInt.value);
        }
        else {
            throw "Unknown prop type!";
        }
    }
}
function CreateRenderers() {
    renderers = [
        new Renderer("Mandelbrot", [
            new Prop("mdb_val", "Valeur de départ (Z<sub>0</sub>)", new vec2(0)),
            new Prop("mdb_offset", "Multiplicateur", 2),
            new Prop("mdb_iterations", "Nombre d'iterations", 400),
        ]),
        new Renderer("Julia", [
            new Prop("mdb_val", "Constante C", new vec2(0.15, 0.6)),
            new Prop("mdb_offset", "Multiplicateur", 2),
            new Prop("mdb_iterations", "Nombre d'iterations", 400),
        ]),
        new Renderer("Burning ship", [
            new Prop("mdb_val", "Valeur de départ (Z<sub>0</sub>)", new vec2(0)),
            new Prop("mdb_offset", "Multiplicateur", 2),
            new Prop("mdb_iterations", "Nombre d'iterations", 400),
        ]),
        new Renderer("Mandelbulb", [
            new Prop("blb_power", "Puissance", 5),
            new Prop("blb_z", "Position Z", 0),
            new Prop("blb_iterations", "Nombre d'iterations", 15),
        ]),
    ];
}
