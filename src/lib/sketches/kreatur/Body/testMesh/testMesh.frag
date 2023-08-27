precision highp float;

uniform float uColorMode;

varying vec2 vUv;
varying float vForward;

void main() {

    vec3 col = mix(vec3(0.0, 0.0, 1.0), vec3(vForward), uColorMode);

    gl_FragColor = vec4(col, 1.0);
}
