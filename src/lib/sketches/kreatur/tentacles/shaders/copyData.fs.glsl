#version 300 es

precision highp float;

uniform sampler2D tData;

in vec2 vUv;

out vec4 data[2];

void main() {
    data[0] = texture(tData, vUv);
}
