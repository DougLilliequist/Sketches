#version 300 es
precision highp float;

uniform sampler2D tMap;

in vec3 vNormal;
//in vec2 vUv;

out vec4 color;

void main() {
    color = vec4(normalize(vNormal) * 0.5 + 0.5, 1.0);
}
