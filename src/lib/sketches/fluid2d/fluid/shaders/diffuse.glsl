precision highp float;

uniform sampler2D tPressure;
uniform sampler2D tDivergence;
uniform float uStep;
uniform float uDt;
uniform float uAlpha;
uniform float uBeta;

varying vec2 vUv;

void main() {

    //RENAME THESE!
    vec3 x1 = texture2D(tPressure, vUv + vec2(uStep * 2.0, 0.0)).xyz;
    vec3 x2 = texture2D(tPressure, vUv + vec2(-uStep * 2.0, 0.0)).xyz;
    vec3 x3 = texture2D(tPressure, vUv + vec2(0.0, uStep * 2.0)).xyz;
    vec3 x4 = texture2D(tPressure, vUv + vec2(0.0, -uStep * 2.0)).xyz;

    vec3 vel = texture2D(tDivergence, vUv).xyz;
    float v = uAlpha;

//    vec3 laplace = (x1 + x2 + x3 + x4 - 4.0 * vel) * 0.25;
//    vec3 result = (vel + (v * laplace)) / (1.0 + v);

    vec3 laplace = (x1 + x2 + x3 + x4 - 4.0 * vel);
    vec3 result = (vel + v * laplace) / (1.0 + 4.0 * v);

    gl_FragColor = vec4(result, 1.0);

}
