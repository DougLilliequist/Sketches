#version 300 es
precision highp float;

in vec3 position; //xyz contains indices

uniform sampler2D tPosition;
uniform float uPositionTextureSize;
uniform float uSize;

out vec4 vNormalA;
out vec4 vNormalB;
out vec4 vNormalC;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    ivec2 coordA = ivec2(calcCoordFromIndex(position.x, uPositionTextureSize) * uPositionTextureSize);
    ivec2 coordB = ivec2(calcCoordFromIndex(position.y, uPositionTextureSize) * uPositionTextureSize);
    ivec2 coordC = ivec2(calcCoordFromIndex(position.z, uPositionTextureSize) * uPositionTextureSize);

    vec3 posA = texelFetch(tPosition, coordA, 0).xyz;
    vec3 posB = texelFetch(tPosition, coordB, 0).xyz;
    vec3 posC = texelFetch(tPosition, coordC, 0).xyz;

    //calc first normal
    vec3 vA = posB - posA;
    vec3 vB = posC - posA;
    vNormalA.xyz = normalize(cross(vA, vB));
    vNormalA.w = position.x;

    //calc second normal
    vA = posC - posB;
    vB = posA - posB;
    vNormalB.xyz = normalize(cross(vA, vB));
    vNormalB.w = position.y;

    //calc third normal
    vA = posA - posC;
    vB = posB - posC;
    vNormalC.xyz = normalize(cross(vA, vB));
    vNormalC.w = position.z;

    vec2 coord = calcCoordFromIndex(float(gl_VertexID), uSize);
    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

}
