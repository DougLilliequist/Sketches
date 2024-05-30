#version 300 es
precision highp float;

in float vRestLength;
out vec4 FragColor;

void main() {
    FragColor = vec4(vRestLength, 0.0, 0.0, 1.0);
}
