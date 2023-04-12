precision highp float;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPos;

uniform sampler2D tRipple;

void main() {

    gl_FragColor = vec4(vec3(texture2D(tRipple, vUv).x), 1.0);
}
