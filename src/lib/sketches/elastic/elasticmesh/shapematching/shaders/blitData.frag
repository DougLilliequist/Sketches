#version 300 es
precision highp float;

in vec3 vPos;
in vec3 vNormal;

out vec4 FragColor[2];

void main() {
    FragColor[0] = vec4(vPos, 1.0);
    FragColor[1] = vec4(vNormal, 1.0);
}
