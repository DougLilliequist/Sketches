precision highp float;

uniform sampler2D tSmoothedDepth;

uniform mat4 uProjectionMatrixInverse;
uniform vec2 uTexelSize;
uniform float uMaxDepth;
uniform vec2 uFrustumSize;

varying vec2 vUv;

vec3 calcViewPosFromDepth(in float depth) {

    vec4 clipPos = vec4(vUv * 2.0 - 1.0, depth, 1.0);
    vec4 viewPos = uProjectionMatrixInverse * clipPos;
    return viewPos.xyz/viewPos.w;

}

vec3 getEyePos(in sampler2D depth, in vec2 coord) {

    float d = texture2D(depth, coord).x;
    return calcViewPosFromDepth(d);

}

void main() {

    float depth = texture2D(tSmoothedDepth, vUv).x;
    if(depth > 0.99) {
        discard;
//        return;
    }

    vec3 viewPos = getEyePos(tSmoothedDepth, vUv);
//
//        vec3 gradientX = getEyePos(tSmoothedDepth, vUv + vec2(uTexelSize.x, 0.0)) - viewPos;
//        vec3 gradientX2 = viewPos - getEyePos(tSmoothedDepth, vUv - vec2(uTexelSize.x, 0.0));
//
//        if(abs(gradientX.z) < abs(gradientX2.z)) {
//            gradientX = getEyePos(tSmoothedDepth, vUv - vec2(uTexelSize.x, 0.0)) - viewPos;
//        };
//
//        vec3 gradientY = getEyePos(tSmoothedDepth, vUv + vec2(0.0, uTexelSize.y)) - viewPos;
//        vec3 gradientY2 = viewPos - getEyePos(tSmoothedDepth, vUv - vec2(0.0, uTexelSize.y));
//
//        if(abs(gradientY.z) < abs(gradientY2.z)) {
//            gradientY = getEyePos(tSmoothedDepth, vUv - vec2(0.0, uTexelSize.y)) - viewPos;
//        };
//
//    vec3 normal = normalize(cross(gradientX, gradientY));

    gl_FragColor = vec4(viewPos, 1.0);
}
