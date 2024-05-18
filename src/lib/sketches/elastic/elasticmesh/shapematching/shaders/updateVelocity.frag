#version 300 es
precision highp float;

in vec3 vVelocity;

void main() {
    gl_FragColor = vec4(vVelocity, 1.0);
}
