#version 300 es
precision highp float;

in vec3 position;
in vec2 uv;

uniform sampler2D tPosition;
uniform sampler2D tNormal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;
out vec3 vNormal;

void main() {

    vec3 pos = texture(tPosition, uv).xyz;
    vec3 normal = texture(tNormal, uv).xyz;

    vNormal = normal;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}
