attribute vec4 vPos;
varying highp vec2 pos;

void main() {
    gl_Position = vec4(vPos.xy, 0.0, 1.0);
    pos = (vPos.xy + vec2(1.0, 1.0)) * 0.5;
}