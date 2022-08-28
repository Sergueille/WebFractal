"use strict";
class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y !== null && y !== void 0 ? y : x;
    }
    copy() {
        return new vec2(this.x, this.y);
    }
    add(other) {
        return new vec2(this.x + other.x, this.y + other.y);
    }
    sub(other) {
        return new vec2(this.x - other.x, this.y - other.y);
    }
    mult(other) {
        return new vec2(this.x * other, this.y * other);
    }
    multv(other) {
        return new vec2(this.x * other.x, this.y * other.y);
    }
    divide(other) {
        return new vec2(this.x / other, this.y / other);
    }
    dividev(other) {
        return new vec2(this.x / other.x, this.y / other.y);
    }
    round() {
        return new vec2(Math.round(this.x), Math.round(this.y));
    }
    isEq(other) {
        return this.x === other.x && this.y === other.y;
    }
    sqrlen() {
        return this.x * this.x + this.y * this.y;
    }
    len() {
        return Math.sqrt(this.sqrlen());
    }
    abs() {
        return new vec2(Math.abs(this.x), Math.abs(this.y));
    }
}
function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ];
}
