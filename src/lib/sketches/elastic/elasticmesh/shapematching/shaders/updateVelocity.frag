#version 300 es
precision highp float;

in vec3 vVelocity;
out vec4 FragColor;

void main() {
    FragColor = vec4(vVelocity, 1.0);
}
