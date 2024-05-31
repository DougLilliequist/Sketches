#version 300 es
precision highp float;

in vec3 position;
in vec2 uv;

uniform sampler2D tPosition;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main() {

    vec3 pos = texture(tPosition, uv).xyz;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPos;

}
