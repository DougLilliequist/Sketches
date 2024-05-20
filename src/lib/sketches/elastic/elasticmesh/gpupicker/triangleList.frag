#version 300 es
precision highp float;

in vec3 vIndices;

out vec4 FragColor;

void main() {
    FragColor = vec4(vIndices, 1.0);
}
