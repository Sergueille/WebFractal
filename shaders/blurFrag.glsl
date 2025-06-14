varying highp vec2 pos;

uniform sampler2D tex;
uniform sampler2D cumul;

uniform highp vec2 shift;
uniform highp float sizeShift;

void main() {
    highp vec3 texval = texture2D(tex, pos).xyz;

    highp vec2 shiftedUV = (pos + shift - vec2(0.5, 0.5)) * (1.0 - sizeShift) + vec2(0.5, 0.5);

    if (shiftedUV.x < 0.0 || shiftedUV.x > 1.0 || shiftedUV.y < 0.0 || shiftedUV.y > 1.0) // Out of screen
    {
        gl_FragColor = vec4(texval, 1.0);
    }
    else
    {
        highp vec3 cumulval = texture2D(cumul, shiftedUV).xyz;
        
        gl_FragColor = vec4(texval * 0.05 + cumulval * 0.95, 1.0);
    }
}
