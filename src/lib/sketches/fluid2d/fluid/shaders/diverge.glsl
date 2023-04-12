precision highp float;

uniform sampler2D tW;
uniform float uStep;

varying vec2 vUv;

void main() {

    float R = texture2D(tW, vUv + vec2(uStep, 0.0)).x;
    float L = texture2D(tW, vUv + vec2(-uStep, 0.0)).x;
    float T = texture2D(tW, vUv + vec2(0.0, uStep)).y;
    float B = texture2D(tW, vUv + vec2(0.0, -uStep)).y;

    float div = ((R - L) + (T - B)) * 0.5;

    gl_FragColor = vec4(vec3(div), 1.0);

}
