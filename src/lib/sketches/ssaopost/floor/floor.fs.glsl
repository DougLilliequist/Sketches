#version 300 es
precision highp float;

in vec3 vNormal;
in vec2 vUv;
out vec4 FragColor[2];

void main() {
    FragColor[0] = vec4(vec3(0.9), 1.0);
    FragColor[1] = vec4(normalize(vNormal), 1.0);
}
