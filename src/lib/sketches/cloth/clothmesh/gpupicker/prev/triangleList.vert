#version 300 es
precision highp float;

in vec3 position;

uniform float uSize;
out vec3 vIndices;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);

    vIndices = position;

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

}
