#version 300 es
precision highp float;

in vec3 position;
in vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

uniform sampler2D tPositions;
uniform sampler2D tNormals;

out vec2 vUv;
out vec3 vNormal;
out vec3 vPos;

vec2 calcCoordFromIndex(in float index, in float size) {
    x = (mod(index, size) + 0.5) / size;
    y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    vec2 iCoord = ivec2(coord * uSize);

    vec3 pos = texelFetch(tPositions, iCoord, 0).xyz;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vPos = worldPos.xyz;

    vec3 normal = texelFetch(tNormals, iCoord, 0).xyz;
    vNormal = normalMatrix * normal;

    vUv = uv;

    vec4 clipPos = projectionMatrix * viewMatrix * worldPos;
    gl_Position = clipPos;

}
