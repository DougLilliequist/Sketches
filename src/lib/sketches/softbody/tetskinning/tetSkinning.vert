#version 300 es
precision highp float;

in vec4 tetIndex;
in vec4 weights;

uniform sampler2D tPosition;
uniform sampler2D tTetIndicies;
uniform sampler2D tWeights;

uniform float uTextureSizeSim;
uniform float uTextureSizeVis;

out vec3 vPos;

vec2 getCoord(in float index, in float size) {

    float x = mod(index, size) + 0.5;
    float y = floor(index / size) + 0.5;
    return vec2(x, y) / size;

}

void main() {

    float index = float(gl_VertexID);

    vec2 c = getCoord(index, uTextureSizeVis);
    gl_Position = vec4(2.0 * c - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    vec4 ti = texture(tTetIndicies, c);
    vec4 w = texture(tWeights, c);

    vec3 p1 = texture(tPosition, getCoord(ti.x, uTextureSizeSim)).xyz * w.x;
    vec3 p2 = texture(tPosition, getCoord(ti.y, uTextureSizeSim)).xyz * w.y;
    vec3 p3 = texture(tPosition, getCoord(ti.z, uTextureSizeSim)).xyz * w.z;
    vec3 p4 = texture(tPosition, getCoord(ti.w, uTextureSizeSim)).xyz * w.w;

    vPos = p1 + p2 + p3 + p4;

}
