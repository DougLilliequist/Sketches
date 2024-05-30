#version 300 es
precision highp float;

uniform sampler2D tPosition;
uniform sampler2D tRestLength;
uniform sampler2D tPickedRestLengths;
uniform sampler2D tRestLengthDiagonal;

uniform vec2 uRestLength;
uniform float uDiagonalRestLength;
uniform float uStiffness;

uniform vec3 uHitPoint;
uniform float uIsDragging;
uniform float uPickedIndex;

uniform vec2 uTexelSize;
uniform float uDeltaTime;

uniform float uConstrainDiagonal;

in vec2 vUv;
out vec4 FragColor;

void applyConstraint(in vec3 pos, in vec3 otherPos, inout vec3 delta, in float restLength, in float k) {
    if(restLength <= 0.0) return;
    vec3 dir = otherPos - pos;
    float mag = length(dir);
    if(mag > restLength) delta += (dir / mag) * (mag - restLength) * k;
}

void main() {

    ivec2 iCoord = ivec2(gl_FragCoord.xy);
    vec4 pos = texture(tPosition, vUv);

    float dist = length(pos);
    if(dist > 4.0) {
        pos.xyz += normalize(vec3(0.0) - pos.xyz) * (dist - 4.0);
    }

    vec4 restLength = texture(tRestLength, vUv);

    vec3 delta = vec3(0.0);

    vec3 lPos = texelFetch(tPosition, iCoord - ivec2(1, 0), 0).xyz;
    vec3 rPos = texelFetch(tPosition, iCoord + ivec2(1, 0), 0).xyz;
    vec3 tPos = texelFetch(tPosition, iCoord + ivec2(0, 1), 0).xyz;
    vec3 bPos = texelFetch(tPosition, iCoord - ivec2(0, 1), 0).xyz;

    bool isLeft = vUv.x > uTexelSize.x;
    bool isRight = vUv.x < 1.0 - uTexelSize.x;
    bool isTop = vUv.y < 1.0 - uTexelSize.y;
    bool isBottom = vUv.y > uTexelSize.y;

    if(isLeft) applyConstraint(pos.xyz, lPos, delta, restLength.x, 0.5);
    if(isRight) applyConstraint(pos.xyz, rPos, delta,  restLength.y, 0.5);
    if(isTop) applyConstraint(pos.xyz, tPos, delta,  restLength.z, 0.5);
    if(isBottom) applyConstraint(pos.xyz, bPos, delta,  restLength.w, 0.5);


    pos.xyz += delta * 0.25;

    if(uIsDragging > 0.5 && uPickedIndex > -1.0) {

        float pickedRestLen = texelFetch(tPickedRestLengths, iCoord, 0).x;
        vec3 dir = uHitPoint - pos.xyz;
        float dist = length(dir);
        if(dist > pickedRestLen) {
            pos.xyz += (dir / dist) * (dist - pickedRestLen) * exp(-pickedRestLen * pickedRestLen) * 0.00005;
        }

    }

    FragColor = pos;

}
