#version 300 es
precision highp float;

in vec3 vPos;
out vec4 FragColor;

void main() {
    FragColor = vec4(vPos, 1.0);
}
