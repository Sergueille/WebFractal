attribute vec4 vPos;
varying highp vec2 pos;
uniform float ratio;
uniform vec2 camPos;
uniform float camSize;

void main() {
    gl_Position = vPos;
    pos = (vec2(vPos.x * ratio, vPos.y) * camSize) + camPos;
}