#precision mediump float;

attribute vec3 position;
attribute vec2 uv;

//uniform mat4 uInvProjMatrix;

varying vec2 vUv;

void main() {
    gl_Position = vec4(vec3(0.0), 1.0);
}
