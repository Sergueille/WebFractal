#define PI 3.1415926538

varying highp vec2 pos;

uniform int renderer;
uniform highp vec3 colorA;
uniform highp vec3 colorB;
uniform highp vec3 colorC;
uniform highp float treshold;

// Mandelbrot & julia
uniform highp vec2 mdb_val;
uniform highp float mdb_iterations;

// Mandelbulb
uniform highp float blb_iterations;
uniform highp float blb_power;
uniform highp float blb_z;

highp float mandelbrot();
highp float julia();
highp float mandelbulb();
void main() {
    highp float val;

    if (renderer == 0) {
        val = mandelbrot();
    }
    else if (renderer == 1) {
        val = julia();
    }
    else if (renderer == 2) {
        val = mandelbulb();
    }

    val = clamp(val, 0.0, 1.0);
    highp vec3 res = val > treshold? colorC : mix(colorA, colorB, val);

    gl_FragColor = vec4(res, 1.0);
}

highp float mandelbrot() {
    highp vec2 Z = mdb_val;
    const int maxIter = 10000;
    for (int i = 0; i < maxIter; i++)
    {
        if (float(i) > mdb_iterations) break;

        highp vec2 newZ = vec2(
            (Z.x * Z.x) - (Z.y * Z.y),
            2.0 * Z.x * Z.y
        );

        Z = newZ + pos;

        if (abs((Z - mdb_val).x) + abs((Z - mdb_val).y) > 2.0)
        {
            return float(i) / mdb_iterations;
        }
    }

    return (mdb_iterations - 1.0) / mdb_iterations;
}

highp float julia() {
    highp vec2 Z = pos;
    const int maxIter = 10000;
    for (int i = 0; i < maxIter; i++)
    {
        if (float(i) > mdb_iterations) break;

        highp vec2 newZ = vec2(
            (Z.x * Z.x) - (Z.y * Z.y),
            2.0 * Z.x * Z.y
        );

        Z = newZ + mdb_val;

        if (dot(Z, Z) > 4.0)
        {
            return float(i) / mdb_iterations;
        }
    }

    return (mdb_iterations - 1.0) / mdb_iterations;
}

highp float atan2(in highp float y, in highp float x)
{
    bool s = (abs(x) > abs(y));
    return mix(PI/2.0 - atan(x,y), atan(y,x), float(s));
}

highp float mandelbulb() {
    highp vec3 pos3 = vec3(pos, blb_z);

    highp vec3 Z = pos3;
    highp float dr = 1.0;
    highp float r;

    const int maxIter = 10000;
    for (int i = 0; i < maxIter; i++) {
        if (float(i) > blb_iterations) break;

        r = length(Z);
        if (r > 2.0) break;

        highp float theta = acos(Z.z / r) * blb_power;
        highp float phi = atan2(Z.y, Z.x) * blb_power;
        highp float zr = pow(r, blb_power);
        dr = pow(r, blb_power - 1.0) * blb_power * dr + 1.0;

        Z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        Z += pos3;
    }

    return 1.0 - ((0.5 * log(r) * r / dr) * 10.0);
}
