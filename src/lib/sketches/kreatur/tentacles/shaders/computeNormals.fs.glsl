#version 300 es

precision highp float;

uniform sampler2D tPosition;
uniform vec2 uTexelSize;

in vec2 vUv;

out vec4 data;

void main() {

    vec3 normal = vec3(0.0);

    vec3 lPos = texture(tPosition, vec2(vUv.x - uTexelSize.x, vUv.y)).xyz;
    vec3 rPos = texture(tPosition, vec2(vUv.x + uTexelSize.x, vUv.y)).xyz;
    vec3 tPos = texture(tPosition, vec2(vUv.x, vUv.y + uTexelSize.y)).xyz;
    vec3 bPos = texture(tPosition, vec2(vUv.x, vUv.y - uTexelSize.y)).xyz;

    vec3 horizontalDelta = normalize(rPos - lPos);
    vec3 verticalDelta = normalize(tPos - bPos);
    normal = cross(horizontalDelta, verticalDelta);

    data = vec4(normal, 1.0);

}
