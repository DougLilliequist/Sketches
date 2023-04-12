precision highp float;

varying vec3 vViewPos;

void main() {
    gl_FragColor = vec4(vec3(vViewPos), 1.0);
}
