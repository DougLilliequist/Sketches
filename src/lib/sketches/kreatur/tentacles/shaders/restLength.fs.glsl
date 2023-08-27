#version 300 es

precision highp float;

uniform sampler2D tPosition;
uniform vec2 uTexelSize;

in vec2 vUv;

out vec4 data;

void main() {

    vec4 pos = texture(tPosition, vUv);

//    vec3 lPos = texture2D(tPosition, vUv - vec2(uTexelSize.x, 0.0)).xyz;
//    vec3 rPos = texture2D(tPosition, vUv + vec2(uTexelSize.x, 0.0)).xyz;
//    vec3 tPos = texture2D(tPosition, vUv + vec2(0.0, uTexelSize.y)).xyz;
//    vec3 bPos = texture2D(tPosition, vUv - vec2(0.0, uTexelSize.y)).xyz;
//
//    bool isLeft = vUv.x > uTexelSize.x;
//    bool isRight = vUv.x < (1.0 - uTexelSize.x);
//    bool isTop = vUv.y < (1.0 - uTexelSize.y);
//    bool isBottom = vUv.y > uTexelSize.y;
//
//    vec4 restLength = vec4(0.0);
//
//    if(isLeft) restLength.x = length(lPos - pos.xyz);
//    if(isRight) restLength.y = length(rPos - pos.xyz);
//    if(isTop) restLength.z = length(tPos - pos.xyz);
//    if(isBottom) restLength.w = length(bPos - pos.xyz);

    data = vec4(length(pos.xyz));

}
