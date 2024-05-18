#version 300 es
precision highp float;

in vec3 vNormal;
out vec4 FragColor;

void main() {
    FragColor = vec4(normalize(vNormal), 1.0);
}
