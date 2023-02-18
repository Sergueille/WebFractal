varying highp vec2 pos;

uniform sampler2D tex;
uniform sampler2D cumul;

void main() {
    lowp vec3 texval = texture2D(tex, pos).xyz;
    lowp vec3 cumulval = texture2D(cumul, pos).xyz;

    gl_FragColor = vec4(texval * 0.05 + cumulval * 0.95, 1.0);
    //gl_FragColor = vec4(texval, 1.0);
}
