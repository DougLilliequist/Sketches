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
uniform float uSize;

out vec2 vUv;
out vec3 vNormal;
out vec3 vPos;
out vec3 vViewPos;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    ivec2 iCoord = ivec2(coord * uSize);

    vec3 pos = texelFetch(tPositions, iCoord, 0).xyz;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vPos = worldPos.xyz;

    vec4 viewPos = viewMatrix * worldPos;
    vViewPos = viewPos.xyz;

    vec3 normal = texelFetch(tNormals, iCoord, 0).xyz;
    vNormal = normalMatrix * normal;

    vUv = uv;

    vec4 clipPos = projectionMatrix * viewPos;
    gl_Position = clipPos;

}
