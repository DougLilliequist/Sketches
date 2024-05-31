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

    vec4 pos = texelFetch(tPosition, iCoord, 0);
    vec4 restLength = texelFetch(tRestLength, iCoord, 0);

    float dist = length(pos);
    float R = 5.0;
    bool oobX = abs(pos.x) > R;
    bool oobY = abs(pos.y) > R;
    bool oobZ = abs(pos.z) > R;
//    if(dist > R) {  pos.xyz += normalize(vec3(0.0) - pos.xyz) * (dist - R) * 0.001; }
    if(oobX || oobY || oobZ) {  pos.xyz += normalize(vec3(0.0) - pos.xyz) * (dist - R) * 0.0001; }

    vec3 delta = vec3(0.0);

    vec3 lPos = texelFetch(tPosition, iCoord - ivec2(1, 0), 0).xyz;
    vec3 rPos = texelFetch(tPosition, iCoord + ivec2(1, 0), 0).xyz;
    vec3 tPos = texelFetch(tPosition, iCoord + ivec2(0, 1), 0).xyz;
    vec3 bPos = texelFetch(tPosition, iCoord - ivec2(0, 1), 0).xyz;

    bool isLeft = vUv.x > uTexelSize.x;
    bool isRight = vUv.x < 1.0 - uTexelSize.x;
    bool isTop = vUv.y < 1.0 - uTexelSize.y;
    bool isBottom = vUv.y > uTexelSize.y;

    float compliance = (0.000001 / (uDeltaTime * uDeltaTime));
    // float compliance = (0.0 / (uDeltaTime * uDeltaTime));
    float k = 1.0 / (2.0 + compliance);

    if(isLeft) applyConstraint(pos.xyz, lPos, delta, restLength.x, k);
    if(isRight) applyConstraint(pos.xyz, rPos, delta,  restLength.y, k);
    if(isTop) applyConstraint(pos.xyz, tPos, delta,  restLength.z, k);
    if(isBottom) applyConstraint(pos.xyz, bPos, delta,  restLength.w, k);

    pos.xyz += delta * (1.0 / 10.0);

    FragColor = pos;

}
