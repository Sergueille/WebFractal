attribute vec4 vPos;
varying highp vec2 pos;
uniform float ratio;
uniform vec2 camPos;
uniform float camSize;

void main() {
    gl_Position = vec4(vPos.xy, 0.0, 1.0);
    pos = (vec2(vPos.x * ratio, vPos.y) * camSize) + camPos;
}