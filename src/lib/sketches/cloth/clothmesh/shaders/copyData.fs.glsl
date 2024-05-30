#version 300 es
precision highp float;

uniform sampler2D tData;

in vec2 vUv;
out vec4 FragColor;

void main() {
    FragColor = texture(tData, vUv);
}
