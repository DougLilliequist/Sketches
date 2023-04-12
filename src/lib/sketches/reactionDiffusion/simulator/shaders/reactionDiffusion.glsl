precision highp float;

uniform sampler2D tA;
uniform sampler2D tB;
uniform sampler2D tDiffuse;
uniform float uStep;
uniform float uDt;

uniform float uRateA;
uniform float uRateB;
uniform float uKill;
uniform float uFeed;

uniform float uIsA;

varying vec2 vUv;

vec2 diffuse(in sampler2D prev) {

    vec2 diffResult = vec2(0.0);

    vec2 l = vUv + vec2(-1.0, 0.0) * uStep;
    vec2 r = vUv + vec2(1.0, 0.0) * uStep;
    vec2 t = vUv + vec2(0.0, 1.0) * uStep;
    vec2 b = vUv + vec2(0.0, -1.0) * uStep;
    vec2 tl = vUv + vec2(-1.0, 1.0) * uStep;
    vec2 tr = vUv + vec2(1.0, 1.0) * uStep;
    vec2 bl = vUv + vec2(-1.0, -1.0) * uStep;
    vec2 br = vUv + vec2(1.0, -1.0) * uStep;

    diffResult += texture2D(prev, bl).xy * 0.05;
    diffResult += texture2D(prev, b).xy * 0.2;
    diffResult += texture2D(prev, br).xy * 0.05;

    diffResult += texture2D(prev, l).xy * 0.2;
    diffResult += texture2D(prev, vUv).xy * -1.0;
    diffResult += texture2D(prev, r).xy * 0.2;

    diffResult += texture2D(prev, tl).xy * 0.05;
    diffResult += texture2D(prev, t).xy * 0.2;
    diffResult += texture2D(prev, tr).xy * 0.05;

    return diffResult;

}

void main() {

    float outputDiffuse = 0.0;
    vec2 ab = texture2D(tDiffuse, vUv).xy;
    float a = ab.x;
    float b = ab.y;

    vec2 laplace = diffuse(tDiffuse);
    float abb = a * b * b;
    a = a + (uRateA * laplace.x - abb + uFeed * (1.0 - a));
    b = b + (uRateB * laplace.y + abb - (uKill + uFeed) * b);


    gl_FragColor = vec4(clamp(vec3(a, b, 0.0), 0.0, 1.0), 1.0);
//    gl_FragColor = vec4(a,b,0.0, 1.0);

}
