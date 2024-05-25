#version 300 es
precision highp float;

in vec4 vNormalA;
in vec4 vNormalB;
in vec4 vNormalC;

out vec4 FragColor[3];

void main() {
    FragColor[0] = vNormalA;
    FragColor[1] = vNormalB;
    FragColor[2] = vNormalC;
}
