precision mediump float;

attribute vec2 position;
attribute vec2 uv;

varying vec2 vUv;
varying vec2 vPos;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
    vUv = uv;
    vPos = position;
}
