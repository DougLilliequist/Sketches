precision highp float;

uniform sampler2D tViewPos;

uniform mat4 uProjectionMatrixInverse;
uniform vec2 uTexelSize;
uniform float uMaxDepth;
uniform vec2 uFrustumSize;

varying vec2 vUv;

//vec3 calcViewPosFromDepth(in float depth) {
//
//    vec4 clipPos = vec4(vUv * 2.0 - 1.0, depth, 1.0);
//    vec4 viewPos = uProjectionMatrixInverse * clipPos;
//    return viewPos.xyz/viewPos.w;
//
//}
//
//vec3 getEyePos(in sampler2D depth, in vec2 coord) {
//
//    float d = texture2D(depth, coord).x;
//    return calcViewPosFromDepth(d);
//
//}

void main() {

    vec3 viewPos = texture2D(tViewPos, vUv).xyz;

    vec3 gradientX = texture2D(tViewPos, vUv + vec2(uTexelSize.x * 2.0, 0.0)).xyz - viewPos;
    vec3 gradientX2 = viewPos - texture2D(tViewPos, vUv + vec2(-uTexelSize.x * 2.0, 0.0)).xyz;

    if(abs(gradientX.z) < abs(gradientX2.z)) gradientX = gradientX2;

    vec3 gradientY = texture2D(tViewPos, vUv + vec2(0.0, uTexelSize.y * 2.0)).xyz - viewPos;
    vec3 gradientY2 = viewPos - texture2D(tViewPos, vUv + vec2(0.0, -uTexelSize.y * 2.0)).xyz;

    if(abs(gradientY2.z) < abs(gradientY.z)) gradientY = gradientY2;

    vec3 normal = normalize(cross(gradientX, gradientY));

    float diff = dot(normal, vec3(0.0, 1.0, 0.5)) * 0.5 + 0.5;

        vec3 lightDir = normalize( vec3(0.0, 1.0, 0.5) - viewPos);
        vec3 e = -normalize(viewPos);
        vec3 r = normalize(reflect(-lightDir, normal));

        float spec = pow(clamp(dot(e, r), 0.0, 1.0), 16.0);

    gl_FragColor = vec4(vec3(diff * 0.8 + spec * 0.2), 1.0);
//    gl_FragColor = vec4(viewPos, 1.0);
}
