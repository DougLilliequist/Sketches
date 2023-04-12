precision highp float;

uniform sampler2D tOld;
uniform sampler2D tNew;

uniform float uStep;

varying vec2 vUv;

void main() {

    vec3 old = texture2D(tOld, vUv).xyz;

    vec3 a = texture2D(tNew, vUv + vec2(uStep, 0.0)).xyz;
    vec3 b = texture2D(tNew, vUv + vec2(-uStep, 0.0)).xyz;
    vec3 c = texture2D(tNew, vUv + vec2(0.0, uStep)).xyz;
    vec3 d = texture2D(tNew, vUv + vec2(0.0, -uStep)).xyz;

    float stpSq = 2.0 * 2.0;
    vec3 laplaceX = (a - (2.0 * old) + b) / (stpSq);
    vec3 laplaceY = (c - (2.0 * old) + d) / (stpSq);

    vec3 laplace = (a + b + c + d - (4.0 * old)) * 0.25;

    gl_FragColor.xyz = old + laplace;
    gl_FragColor.w = 1.0;

}
