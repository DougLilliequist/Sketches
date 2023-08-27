#version 300 es
precision highp float;

//in vec3 position;
in vec2 uv;

uniform sampler2D tPosition;
uniform sampler2D tNormal;
uniform sampler2D tWeights;
uniform sampler2D tTetIndicies;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

uniform float uTextureSize;
uniform float uTextureSizeSim;

out vec3 vNormal;
//out vec2 vUv;

vec2 getCoord(float i, float size) {
    float posX = mod(i, size) + 0.5;
    float posY = floor(i / size) + 0.5;
    return vec2(posX, posY)/ size;
}


void main() {

    float index = float(gl_VertexID);

    vec2 c = getCoord(index, uTextureSize);
    vec4 ti = texture(tTetIndicies, c);
    vec4 w = texture(tWeights, c);

    vec3 pos = texture(tPosition, getCoord(index, uTextureSize)).xyz;

    vec4 norm = texture(tNormal, getCoord(index, uTextureSize));
    if(norm.w > 0.0) norm /= max(1.0, norm.w - 1.0);
    norm.xyz = normalize(norm.xyz);

    vNormal = normalMatrix * norm.xyz;
//    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
