#version 300 es
precision highp float;

uniform sampler2D tPosition;
uniform sampler2D tRestLength;
//uniform sampler2D tCurrentConstraints;
uniform sampler2D tRestLengthDiagonal;

uniform vec2 uRestLength;
uniform float uDiagonalRestLength;
uniform float uStiffness;

uniform vec3 uInputPos;
uniform float uApplyInput;

uniform vec2 uTexelSize;
uniform float uDeltaTime;

uniform float uConstrainDiagonal;

in vec2 vUv;
out vec4 FragColor;

void applyConstraint(in vec3 pos, in vec3 otherPos, inout vec3 delta, in float restLength, in float k) {

    if(restLength <= 0.0) return;
    vec3 dir = otherPos - pos;
    float mag = length(dir);
    if(mag > 0.0) delta += (dir * (1.0/mag)) * (mag - restLength) * 0.5;
}

void applyCollision(in vec3 pos, in vec3 otherPos, inout vec3 delta, in float restLength, in float k) {
    vec3 dir = otherPos - pos;
    float mag = length(dir);
    if(mag < restLength && mag > 0.0) delta -= (dir * (1.0/mag)) * (mag - (restLength)) * 0.5;
}

void main() {

    vec4 pos = texture(tPosition, vUv);

    float dist = length(pos);
    if(dist > 4.0) {
        pos.xyz += normalize(vec3(0.0) - pos.xyz) * (dist - 4.0);
    }

    vec4 restLength = texture(tRestLength, vUv);

    vec3 delta = vec3(0.0);

//        if(vUv.x > uTexelSize.x && vUv.x < 1.0 - uTexelSize.x && vUv.y > uTexelSize.y && vUv.y < 1.0 - uTexelSize.y) {

            vec3 lPos = texture(tPosition, vUv - vec2(uTexelSize.x, 0.0)).xyz;
            vec3 rPos = texture(tPosition, vUv + vec2(uTexelSize.x, 0.0)).xyz;
            vec3 tPos = texture(tPosition, vUv + vec2(0.0, uTexelSize.y)).xyz;
            vec3 bPos = texture(tPosition, vUv - vec2(0.0, uTexelSize.y)).xyz;

            bool isLeft = vUv.x > uTexelSize.x;
            bool isRight = vUv.x < 1.0 - uTexelSize.x;
            bool isTop = vUv.y < 1.0 - uTexelSize.y;
            bool isBottom = vUv.y > uTexelSize.y;

            if(isLeft) applyConstraint(pos.xyz, lPos, delta, restLength.x, 0.5);
            if(isRight) applyConstraint(pos.xyz, rPos, delta,  restLength.y, 0.5);
            if(isTop) applyConstraint(pos.xyz, tPos, delta,  restLength.z, 0.5);
            if(isBottom) applyConstraint(pos.xyz, bPos, delta,  restLength.w, 0.5);

//        }

    pos.xyz += delta * 0.25;


    FragColor = pos;

}
