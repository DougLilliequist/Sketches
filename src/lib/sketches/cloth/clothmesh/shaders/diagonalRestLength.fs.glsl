#version 300 es
precision highp float;

uniform sampler2D tPosition;
uniform vec2 uTexelSize;

in vec2 vUv;
out vec4 FragColor;

void main() {

    vec4 pos = texture(tPosition, vUv);

    vec3 tlPos = texture(tPosition, vUv + vec2(-uTexelSize.x, uTexelSize.y)).xyz;
    vec3 trPos = texture(tPosition, vUv + vec2(uTexelSize.x, uTexelSize.y)).xyz;
    vec3 blPos = texture(tPosition, vUv + vec2(-uTexelSize.x, -uTexelSize.y)).xyz;
    vec3 brPos = texture(tPosition, vUv + vec2(uTexelSize.x, -uTexelSize.y)).xyz;

    bool isTopLeft = vUv.x > uTexelSize.x && vUv.y < 1.0 - uTexelSize.y;
    bool isTopRight = vUv.x < 1.0 - uTexelSize.x && vUv.y < 1.0 - uTexelSize.y;
    bool isBottomLeft = vUv.x > uTexelSize.x && vUv.y > uTexelSize.y;
    bool isBottomRight = vUv.x < 1.0 - uTexelSize.x && vUv.y > uTexelSize.y;

    vec4 restLength = vec4(0.0);

    if(isTopLeft) restLength.x = length(tlPos - pos.xyz);
    if(isTopRight) restLength.y = length(trPos - pos.xyz);
    if(isBottomLeft) restLength.z = length(blPos - pos.xyz);
    if(isBottomRight) restLength.w = length(brPos - pos.xyz);

//    if(vUv.x < uTexelSize.x && vUv.y < uTexelSize.y) {
//        restLength.x = length(tlPos - pos.xyz);
//    }
//
//    if(vUv.x > 1.0-uTexelSize.x && vUv.y < uTexelSize.y) {
//        restLength.y = length(trPos - pos.xyz);
//    }
//
//    if(vUv.x < uTexelSize.x && vUv.y > 1.0-uTexelSize.y) {
//        restLength.z = length(blPos - pos.xyz);
//    }
//
//    if(vUv.x > 1.0-uTexelSize.x && vUv.y > 1.0-uTexelSize.y) {
//        restLength.w = length(brPos - pos.xyz);
//    }

    FragColor = restLength;

}
