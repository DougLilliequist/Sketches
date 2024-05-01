precision highp float;

uniform sampler2D tPrev;
uniform sampler2D tCurrent;

uniform float uAlpha;
uniform float uStep;
uniform float uDt;

varying vec2 vUv;

void main() {

    float z1 = texture2D(tCurrent, vUv + vec2(uStep * 2.0, 0.0)).x;
    float z2 = texture2D(tCurrent, vUv + vec2(uStep * -2.0, 0.0)).x;
    float z3 = texture2D(tCurrent, vUv + vec2(0.0, uStep * 2.0)).x;
    float z4 = texture2D(tCurrent, vUv + vec2(0.0, uStep * -2.0)).x;
    float z = texture2D(tCurrent, vUv).x;

    float zPrev = texture2D(tPrev, vUv).x;
    //float c = 1.0/(2.7 * 2.7);
    float c = uStep * 100.0;
    float laplace = ((z1 + z2 + z3 + z4) - 4.0*z) * 0.25;
    float wave = (c * laplace) + (2.0*z - zPrev);
    //gl_FragColor = vec4(vec3(wave) * 0.998, 1.0);
    gl_FragColor = vec4(vec3(wave) * 0.988, 1.0);

}
