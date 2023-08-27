#version 300 es
precision highp float;

in vec4 tetIndex;
in vec4 weights;

uniform float uTextureSize;
uniform float uRenderWeights;

out vec4 vData;

vec2 getCoord(in float index, in float size) {

    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);

}

void main() {

    float index = float(gl_VertexID);
    vec2 c = getCoord(index, uTextureSize);
    gl_Position = vec4(2.0 * c - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    vData = uRenderWeights > 0.0 ? weights : tetIndex;

}
