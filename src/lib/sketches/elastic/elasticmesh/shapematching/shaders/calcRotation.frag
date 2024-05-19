#version 300 es
precision highp float;

in vec4 vRotation;
in vec3 vApqAqqMatrixA;
in vec3 vApqAqqMatrixB;
in vec3 vApqAqqMatrixC;

out vec4 FragColor[4];

void main() {
    FragColor[0] = vRotation;
    FragColor[1] = vec4(vApqAqqMatrixA, 1.0);
    FragColor[2] = vec4(vApqAqqMatrixB, 1.0);
    FragColor[3] = vec4(vApqAqqMatrixC, 1.0);
}
