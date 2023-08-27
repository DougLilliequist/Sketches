#version 300 es

precision highp float;

uniform sampler2D tPosition;
uniform sampler2D tPrevPosition;
uniform sampler2D tNextCorrection;

uniform float uDeltaTime;
uniform vec2 uTexelSize;

in vec2 vUv;

out vec4 data;

void main() {

    vec3 pos = texture(tPosition, vUv).xyz;
    vec3 prevPos = texture(tPrevPosition, vUv).xyz;
    vec3 vel = (pos - prevPos) / uDeltaTime;

    if(vUv.x < 1.0 - uTexelSize.x) {
        vec3 D = texture(tNextCorrection, vec2(vUv.x + uTexelSize.x, vUv.y)).xyz;
//        vel = vel + (-D / uDeltaTime);
        vel += (-D / uDeltaTime) * 0.93;
    }

    vel *= 0.97;

    data = vec4(vel, 1.0);

}
