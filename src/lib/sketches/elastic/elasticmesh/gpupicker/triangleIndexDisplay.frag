#version 300 es
precision highp float;

in float vData;

out vec4 FragColor;

void main() {
    FragColor = vec4(vData, 0.0, 0.0, 1.0);
}
