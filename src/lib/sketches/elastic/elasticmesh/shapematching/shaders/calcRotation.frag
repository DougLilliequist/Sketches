#version 300 es
precision highp float;

in vec4 vRotation;
in vec3 vAqpAqqMatrixA;
in vec3 vAqpAqqMatrixB;
in vec3 vAqpAqqMatrixC;

out vec4 FragColor[4];

void main() {
    FragColor[0] = vRotation;
    FragColor[1] = vec4(vAqpAqqMatrixA, 1.0);
    FragColor[2] = vec4(vAqpAqqMatrixB, 1.0);
    FragColor[3] = vec4(vAqpAqqMatrixC, 1.0);
}
