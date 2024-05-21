#version 300 es
precision mediump float;

in float position;
in float triangleIndex;

uniform sampler2D tPosition;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float uSize;

//out float vData;
out vec3 vData;

#define EPS 1.0e-9

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    vec3 pos = texelFetch(tPosition, ivec2(calcCoordFromIndex(position, uSize) * uSize), 0).xyz;
    vData = pos;

    vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    gl_Position = clipPos;
}
