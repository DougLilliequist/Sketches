precision highp float;

uniform sampler2D tW;
uniform sampler2D tPressure;
uniform float uStep;

varying vec2 vUv;

void main() {

    float R = texture2D(tPressure, vUv + vec2(uStep, 0.0)).x;
    float L = texture2D(tPressure, vUv + vec2(-uStep, 0.0)).x;
    float T = texture2D(tPressure, vUv + vec2(0.0, uStep)).x;
    float B = texture2D(tPressure, vUv + vec2(0.0, -uStep)).x;

    float gradX = (R - L);
    float gradY = (T - B);
//    vec2 grad = vec2(gradX, gradY) / (2.0 * uStep);
//    vec2 grad = vec2(gradX, gradY) / uStep;
//    vec2 grad = vec2(gradX, gradY) * 0.5 * uStep;
    vec2 grad = vec2(gradX, gradY) * 0.5;

    vec2 vel = texture2D(tW, vUv).xy;
    vel -= grad;

    gl_FragColor = vec4(vel, 0.0, 1.0);

}
