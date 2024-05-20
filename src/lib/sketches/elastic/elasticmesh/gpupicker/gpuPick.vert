#version 300 es
precision highp float;

in vec2 position;
in vec2 uv;

uniform sampler2D tPosition;
uniform sampler2D tTriangles;

uniform float uIndex;
uniform vec3 uRayDirection;
uniform vec3 uRayOrigin;
uniform float uSize;

out vec4 vData;

#define EPS 1.0e-9

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    ivec2 triangleCoord = ivec2(calcCoordFromIndex(uIndex, 256.0) * 256.0);
    gl_Position = vec4(0.5, 0.5, 0.0, 1.0);
    gl_PointSize = 1.0;

    if(uIndex < 0.0) {
        vData = vec4(999.0, 999.0, 999.0, -1.0);
        return;
    }

    vec3 indicies = texelFetch(tTriangles, triangleCoord, 0).xyz;

    ivec2 coordA = ivec2(calcCoordFromIndex(indicies.x, uSize) * uSize);
    ivec2 coordB = ivec2(calcCoordFromIndex(indicies.y, uSize) * uSize);
    ivec2 coordC = ivec2(calcCoordFromIndex(indicies.z, uSize) * uSize);

    vec3 posA = texelFetch(tPosition, coordA, 0).xyz;
    vec3 posB = texelFetch(tPosition, coordB, 0).xyz;
    vec3 posC = texelFetch(tPosition, coordC, 0).xyz;

    vec3 positions[3] = vec3[3](posA, posB, posC);
    float indices[3] = float[3](indicies.x, indicies.y, indicies.z);

    float minDist = 9999.0;
    float desiredIndex = -1.0;
    vec3 desiredPos = vec3(999.0, 999.0, 999.0);
    vec3 rayDir = normalize(uRayDirection);
    for(int i = 0; i < 3; i++) {

        vec3 dir = positions[i] - uRayOrigin;
        float projection = dot(dir, rayDir);
        vec3 projectionPos = uRayOrigin + rayDir * projection;
        float dist = length(positions[i] - projectionPos);
        if(dist < minDist) {
            minDist = dist;
            desiredIndex = indicies[i];
            desiredPos = positions[i];
        }

    }

    vData = vec4(desiredPos, desiredIndex);

}
