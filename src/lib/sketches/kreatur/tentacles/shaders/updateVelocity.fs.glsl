#version 300 es

precision highp float;

uniform sampler2D tPosition;
uniform sampler2D tPrevPosition;
uniform sampler2D tNextCorrection;

uniform float uDeltaTime;
uniform vec2 uTexelSize;

in vec2 vUv;

out vec4 data;

#define DAMPING 0.93
#define INERTIA 0.97

void main() {

    vec3 pos = texture(tPosition, vUv).xyz;
    vec3 prevPos = texture(tPrevPosition, vUv).xyz;
    vec3 vel = (pos - prevPos) / uDeltaTime;

    if(vUv.x < 1.0 - uTexelSize.x) {
        vec3 D = texture(tNextCorrection, vec2(vUv.x + uTexelSize.x, vUv.y)).xyz;
//        vel = vel + (-D / uDeltaTime);

        //.93 is the best setting iirc from paper?
        vel += (-D / uDeltaTime) * DAMPING;
    }

    //.97 as inertia with the current damping factor looks best so far
    vel *= INERTIA;
//    vel *= 0.9;

    data = vec4(vel, 1.0);

}