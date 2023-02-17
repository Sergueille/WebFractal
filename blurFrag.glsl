varying highp vec2 pos;
uniform sampler2D tex;  

void main() {
    lowp vec3 val = texture2D(tex, pos).xyz;
    gl_FragColor = vec4(val, 1.0);
}
