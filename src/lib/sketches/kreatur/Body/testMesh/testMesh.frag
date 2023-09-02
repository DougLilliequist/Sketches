precision highp float;

uniform float uColorMode;

varying vec2 vUv;
varying float vForward;
varying vec3 vNormal;

void main() {

    vec3 col = mix(vec3(0.0, 0.0, 1.0), vec3(0.83, 0.07, 0.1), uColorMode);

    gl_FragColor = vec4(vNormal*0.5+0.5, 1.0);
}
