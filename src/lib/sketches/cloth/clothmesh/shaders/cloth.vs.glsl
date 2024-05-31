#version 300 es
precision highp float;

in vec3 position;
in vec2 uv;

uniform sampler2D tPosition;
uniform sampler2D tNormal;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform mat4 shadowProjectionMatrix;
uniform mat4 shadowViewMatrix;

out vec2 vUv;
out vec3 vNormal;
out vec3 vPos;
out vec4 vShadowCoord;

void main() {

    vec3 pos = texture(tPosition, uv).xyz;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vPos = worldPos.xyz;

    vec3 normal = texture(tNormal, uv).xyz;
    vNormal = normalMatrix * normal;
    vUv = uv;

    vec4 shadowPos = shadowProjectionMatrix * shadowViewMatrix * worldPos;
    vShadowCoord = shadowPos;

    gl_Position = projectionMatrix * viewMatrix * worldPos;

}
