precision highp float;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vNormal;

void main() {

    gl_Position = vec4(position, 1.0);

    vNormal = normal;

}