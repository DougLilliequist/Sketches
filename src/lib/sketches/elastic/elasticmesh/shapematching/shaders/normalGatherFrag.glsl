#version 300 es
precision highp float;

in vec4 vNormal;
out vec4 FragColor;

void main() {
    FragColor = vNormal;
}
