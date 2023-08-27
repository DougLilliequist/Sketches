#version 300 es
precision highp float;

in vec3 position;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float uTextureSize;

out vec3 vPos;

vec2 getCoord(in float index, in float size) {

    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);

}

void main() {

    float index = float(gl_VertexID);
    vec2 c = getCoord(index, uTextureSize);

    vPos = position;

    gl_Position = vec4(2.0 * c - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

//    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//    gl_PointSize = 5.0;

}
