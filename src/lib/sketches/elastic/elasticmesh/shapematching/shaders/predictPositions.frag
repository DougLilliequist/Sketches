#version 300 es
precision highp float;

in vec3 vPrevPos;
in vec3 vPredictedPos;

out vec4 FragColor[2];

void main() {
    FragColor[0] = vec4(vPrevPos, 1.0);
    FragColor[1] = vec4(vPredictedPos, 1.0);
}
