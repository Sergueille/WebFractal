varying highp vec2 pos;
uniform sampler2D tex;

void main() {
    gl_FragColor = vec4(texture2D(tex, pos).xyz, 1.0);
}
