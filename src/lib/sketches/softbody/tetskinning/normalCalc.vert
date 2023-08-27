precision highp float;

attribute vec3 position;

uniform sampler2D tPosition;
uniform float uTextureSize;

varying vec3 vNormal;

vec2 getCoord(in float index, in float size) {

    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);

}

void main() {

    float indexA = position.x;
    float indexB = position.y;
    float indexC = position.z;

    vec2 coord = getCoord(indexA, uTextureSize);
    vec2 coordB = getCoord(indexB, uTextureSize);
    vec2 coordC = getCoord(indexC, uTextureSize);

    vec3 vA = texture2D(tPosition, coord).xyz;
    vec3 vB = texture2D(tPosition, coordB).xyz;
    vec3 vC = texture2D(tPosition, coordC).xyz;

    vec3 v0 = (vB - vA);
    vec3 v1 = (vC - vA);

    vNormal = normalize(cross(v0, v1));
    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

}
