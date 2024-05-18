#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tData;
uniform float uSize;

out vec4 vData;

vec2 calcCoordFromIndex(in float index, in float size) {
    x = (mod(index, size) + 0.5) / size;
    y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    vec2 iCoord = ivec2(coord);

    gl_Position = vec4(0.5, 0.5, 0.0, 1.0);
    gl_PointSize = 1.0;

    vec3 data = texelFetch(tData, iCoord, 0).xyz;
    vData = vec4(data, 1.0);

}
