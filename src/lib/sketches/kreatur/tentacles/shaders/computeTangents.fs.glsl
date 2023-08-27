#version 300 es

precision highp float;

uniform sampler2D tPosition;
uniform vec2 uTexelSize;

in vec2 vUv;

out vec4 data;

void main() {

    vec3 tangent = vec3(0.0);

    vec3 currentPos = texture(tPosition, vec2(vUv.x, vUv.y)).xyz;
    vec3 nextPos = texture(tPosition, vec2(vUv.x + uTexelSize.x, vUv.y)).xyz;
    vec3 prevPos = texture(tPosition, vec2(vUv.x - uTexelSize.x, vUv.y)).xyz;

    if(vUv.x < 1.0 - uTexelSize.x) {
        tangent = normalize(nextPos - currentPos);
    } else {
        tangent = normalize(currentPos - prevPos);
    }

    data = vec4(tangent, 1.0);

}
