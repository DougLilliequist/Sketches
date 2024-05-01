precision highp float;

uniform sampler2D tA;
uniform sampler2D tB;
uniform float uStep;
uniform float uDt;
uniform float uRateA;
uniform float uFeed;

varying vec2 vUv;

float diffuse(in sampler2D prev) {

    float diffResult = 0.0;

    vec2 l = vUv + vec2(-1.0, 0.0) * uStep;
    vec2 r = vUv + vec2(1.0, 0.0) * uStep;
    vec2 t = vUv + vec2(0.0, 1.0) * uStep;
    vec2 b = vUv + vec2(0.0, -1.0) * uStep;
    vec2 tl = vUv + vec2(-1.0, 1.0) * uStep;
    vec2 tr = vUv + vec2(1.0, 1.0) * uStep;
    vec2 bl = vUv + vec2(-1.0, -1.0) * uStep;
    vec2 br = vUv + vec2(1.0, -1.0) * uStep;

    diffResult += texture2D(prev, bl).x * 0.05;
    diffResult += texture2D(prev, b).x * 0.2;
    diffResult += texture2D(prev, br).x * 0.05;

    diffResult += texture2D(prev, l).x * 0.2;
    diffResult += texture2D(prev, vUv).x * -1.0;
    diffResult += texture2D(prev, r).x * 0.2;

    diffResult += texture2D(prev, tl).x * 0.05;
    diffResult += texture2D(prev, t).x * 0.2;
    diffResult += texture2D(prev, tr).x * 0.05;

    return diffResult;

}

void main() {

    float a = texture2D(tA, vUv).x;
    float b = texture2D(tB, vUv).x;
    float bSq = b * b;
    float res = a + (diffuse(tA) - (a * bSq) + uFeed * (1.0 - a)) * uDt;
    gl_FragColor = vec4(vec3(1.0 - res), 1.0);

}
