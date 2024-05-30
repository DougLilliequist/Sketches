#version 300 es
precision highp float;

in vec3 vNormal;
in vec2 vUv;

out vec4 FragColor;

void main() {

    FragColor = vec4(vNormal*0.5+0.5, 1.0);

}
