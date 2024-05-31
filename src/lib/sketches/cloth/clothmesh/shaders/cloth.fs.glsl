#version 300 es
precision highp float;

uniform samplerCube tEnvMap;

uniform sampler2D tShadow;
uniform float uShadowTexelSize;
uniform sampler2D tBlueNoise;

uniform float uTime;

uniform vec3 cameraPosition;

in vec3 vNormal;
in vec3 vPos;
in vec2 vUv;
in vec4 vShadowCoord;

out vec4 FragColor;

float unpackRGBA (vec4 v) {
    return dot(v, 1.0 / vec4(1.0, 255.0, 65025.0, 16581375.0));
}

float sampleShadow(vec2 coord, float depth) {

    float occlusion = unpackRGBA(texture(tShadow, coord));
//    if(occlusion < depth -  0.0001) return 0.0;
    if(occlusion < depth -  0.00048) return 0.0;
    return 1.0;
}

float calcShadow(vec4 shadowCoord) {

    vec3 coord = shadowCoord.xyz/shadowCoord.w;
    coord = coord * 0.5 + 0.5;

    if(coord.x < 0.0 || coord.x > 1.0) return 1.0;
    if(coord.y < 0.0 || coord.y > 1.0) return 1.0;
    if(coord.z < 0.0 || coord.z > 1.0) return 1.0;

    float totalShadow = 0.0;
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {

            vec2 offset = vec2(x, y);
            vec2 jitter = (texture(tBlueNoise, (gl_FragCoord.xy + offset)/256.0).xy - 0.5);
            totalShadow += sampleShadow(coord.xy + (offset + jitter) * uShadowTexelSize, coord.z);
        }
    }

    totalShadow /= 9.0;

    return totalShadow;
}

void main() {

    vec3 normal = normalize(vNormal);
    vec3 eyeDir = normalize(cameraPosition - vPos);
    vec3 lightDir = normalize(vec3(0.0, 10.0, 5.0) - vPos);
    vec3 halfDir = normalize(eyeDir + lightDir);

//    float diff = dot(lightDir, normal) * 0.5 + 0.5;
//    float spec = pow(max(0.0, dot(halfDir, normal)), 128.0);

    float fresnel;
    float diff;
    float spec;
    vec3 reflectionDir;
    if(gl_FrontFacing) {
       fresnel = pow(1.0 - max(0.0, dot(eyeDir, normal)), 2.0);
        diff = dot(lightDir, normal) * 0.5 + 0.5;
        spec = pow(max(0.0, dot(halfDir, normal)), 256.0);
        reflectionDir = reflect(-eyeDir, normal);
    } else {
        fresnel = pow(1.0 - max(0.0, dot(eyeDir, -normal)), 2.0);
        diff = dot(lightDir, -normal) * 0.5 + 0.5;
        spec = pow(max(0.0, dot(halfDir, -normal)), 256.0);
        reflectionDir = reflect(-eyeDir, -normal);
    }


    vec3 env = texture(tEnvMap, reflectionDir).xyz;
    vec3 col = mix(vec3(1.0, 0.25, 0.15), (diff * 0.1) + (spec * 0.3) + env * 0.6, fresnel);
    vec3 light = (diff * 0.05) + (spec * 0.2) + env * 0.7 + (normal.y * 0.5 + 0.5) * 0.05;

    float shadow = calcShadow(vShadowCoord);
    FragColor = vec4(light * mix(0.1, 1.0, shadow), 1.0);

}
