precision highp float;

uniform sampler2D tU;
uniform sampler2D tX;
uniform float uDt;
uniform float uStep;
uniform float uDissipation;

varying vec2 vUv;

void main() {

    vec2 u = texture2D(tU, vUv).xy;
    vec2 coord = vUv - u * uDt * uStep;
    vec4 x = texture2D(tX, coord);
    x.xyz *= uDissipation;
    gl_FragColor = x;
    gl_FragColor.a = 1.0;

}
