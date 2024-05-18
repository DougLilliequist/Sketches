#version 300 es
precision highp float;

in vec3 A;
in vec3 B;
in vec3 C;

out vec4 FragColor[3];

void main() {
    FragColor[0] = vec4(A, 1.0);
    FragColor[1] = vec4(B, 1.0);
    FragColor[2] = vec4(C, 1.0);
}
