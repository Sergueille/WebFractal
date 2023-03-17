class vec2 {
    public x: number;
    public y: number;

    constructor(x: number, y?: number) {
        this.x = x;
        this.y = y ?? x;
    }

    copy() {
        return new vec2(this.x, this.y);
    }

    add(other: vec2) {
        return new vec2(this.x + other.x, this.y + other.y);
    }

    sub(other: vec2) {
        return new vec2(this.x - other.x, this.y - other.y);
    }

    mult(other: number) {
        return new vec2(this.x * other, this.y * other);
    }

    multv(other: vec2) {
        return new vec2(this.x * other.x, this.y * other.y);
    }

    divide(other: number) {
        return new vec2(this.x / other, this.y / other);
    }

    dividev(other: vec2) {
        return new vec2(this.x / other.x, this.y / other.y);
    }

    round() {
        return new vec2(Math.round(this.x), Math.round(this.y));
    }

    isEq(other: vec2) {
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

function delay(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!!;
    return [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ];
}

