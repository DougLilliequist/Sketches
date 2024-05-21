#version 300 es
precision highp float;

in vec2 position;
in vec2 uv;

uniform sampler2D tPosition;
uniform sampler2D tTriangles;
uniform sampler2D tIndex;

uniform float uIndex;
uniform vec3 uRayDirection;
uniform vec3 uRayOrigin;
uniform vec2 uInputPos;
uniform float uSize;

out vec4 vData;

#define EPS 1.0e-9

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    vec4 pickedIndex = texelFetch(tIndex, ivec2(uInputPos), 0);
    gl_Position = vec4(0.5, 0.5, 0.0, 1.0);
    gl_PointSize = 1.0;

    if(pickedIndex.w < 0.0) {
        vData = vec4(999.0, 999.0, 999.0, -1.0);
        return;
    }

    vData = vec4(pickedIndex.xyz, 1.0);
}
