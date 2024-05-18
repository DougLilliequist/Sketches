precision highp float;

uniform sampler2D tMap;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(tMap, vUv);
}
