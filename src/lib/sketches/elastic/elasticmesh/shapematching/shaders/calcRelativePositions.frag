#version 300 es
precision highp float;

in vec3 vRelativePos;
out vec4 FragColor;

void main() {
    FragColor = vec4(vRelativePos, 1.0);
}
