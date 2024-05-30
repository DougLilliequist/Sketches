#version 300 es
precision highp float;

//in float vData;
in vec3 vData;

out vec4 FragColor;

void main() {
    FragColor = vec4(vData, 1.0);
}
