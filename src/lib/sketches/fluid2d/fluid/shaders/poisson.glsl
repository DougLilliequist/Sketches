precision highp float;

uniform sampler2D tPressure;
uniform sampler2D tDivergence;
uniform float uStep;
uniform float uDt;
uniform float uAlpha;
uniform float uBeta;

varying vec2 vUv;

/*
    Laplacian is a summation second partial derivatvies (derivatvies of derivatives),
    meaning we are taking the sum and avaraging all the
    central differences at x
*/

void main() {

    vec3 x1 = texture2D(tPressure, vUv + vec2(uStep * 2.0, 0.0)).xyz;
    vec3 x2 = texture2D(tPressure, vUv + vec2(-uStep * 2.0, 0.0)).xyz;
    vec3 x3 = texture2D(tPressure, vUv + vec2(0.0, uStep * 2.0)).xyz;
    vec3 x4 = texture2D(tPressure, vUv + vec2(0.0, -uStep * 2.0)).xyz;
    vec3 x = texture2D(tDivergence, vUv).xyz;

    //can also be read as (x1 - x) + (x2 - x) + (x3 - x) + (x4 - x) / 4
    vec3 result = (x1 + x2 + x3 + x4 - 4.0 * x) * 0.25;

    gl_FragColor = vec4(result, 1.0);

}
