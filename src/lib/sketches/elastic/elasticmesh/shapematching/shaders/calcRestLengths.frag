#version 300 es
precision highp float;

in float vRestLength;
out vec4 FragColor;

void main() {
    gl_FragColor = vec4(vRestLength);
}
