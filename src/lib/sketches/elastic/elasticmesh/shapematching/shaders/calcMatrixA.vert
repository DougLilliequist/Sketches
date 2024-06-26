#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tRelativePositions;
uniform sampler2D tInitRelativePositions;
uniform float uSize;

out vec3 A;
out vec3 B;
out vec3 C;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    ivec2 iCoord = ivec2(coord * uSize);

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    vec3 q = texelFetch(tInitRelativePositions, iCoord, 0).xyz;
    vec3 p = texelFetch(tRelativePositions, iCoord, 0).xyz;

    mat3 pqT_qqT = outerProduct(p, q);
    A = pqT_qqT[0];
    B = pqT_qqT[1];
    C = pqT_qqT[2];

}
