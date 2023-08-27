#version 300 es

precision highp float;

uniform sampler2D tPosition;

uniform vec2 uRestLength;
uniform float uStiffness;

uniform vec3 uInputPos;
uniform float uApplyInput;

uniform vec2 uTexelSize;
uniform float uDeltaTime;

in vec2 vUv;

out vec4 data[2];

void applyConstraint(in vec3 pos, in vec3 otherPos, inout vec3 delta, in float restLength, in float stifness) {

    vec3 dir = otherPos - pos;
    float mag = length(dir);
    if(mag == 0.0) return;
    delta += normalize(dir) * (mag - restLength) * stifness;
}

void main() {

    vec3 pos = texture(tPosition, vUv).xyz;
    vec3 correction = vec3(0.0);

    float compliance = 0.00001 / uDeltaTime / uDeltaTime;
//    compliance = 1.0 / compliance;

    if(vUv.x > uTexelSize.x) {

        vec3 target = texture(tPosition, vec2(vUv.x - uTexelSize.x, vUv.y)).xyz;
        vec3 dir = target - pos.xyz;
        float mag = length(dir);
        if(mag > 0.0) {
            correction = normalize(dir) * (mag - uRestLength.x);
            correction /= (2.0 + compliance);
            pos.xyz += correction;
        }

    }

    data[0] = vec4(pos, 1.0);
    data[1] = vec4(correction, 1.0);

}
