precision mediump float;

varying vec3 vNormal;

void main() {
    gl_FragColor = vec4(normalize(vNormal), 1.0);
}
