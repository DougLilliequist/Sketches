precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform sampler2D tPosition;
uniform sampler2D tTangent;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec3 vNormal;

void main() {

    vec3 pos = texture2D(tPosition, uv).xyz;
    vec3 normal = texture2D(tTangent, uv).xyz;

    vNormal = normal;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    gl_PointSize = 2.0;

}
