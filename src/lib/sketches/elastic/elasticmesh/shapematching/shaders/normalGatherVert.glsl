#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tNormal;
uniform sampler2D tPrev;

uniform float uPositionTextureSize;
uniform float uSize;

out vec4 vNormal;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    vec4 normal = texelFetch(tNormal, ivec2(coord * uSize), 0); //xyz - normal components, w - vertex index
    coord = calcCoordFromIndex(normal.w, uPositionTextureSize); //determine new coordinate to render point

    vec4 prev = texelFetch(tPrev, ivec2(coord * uPositionTextureSize), 0);
    vNormal = prev + vec4(normal.xyz, 1.0);

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

}
