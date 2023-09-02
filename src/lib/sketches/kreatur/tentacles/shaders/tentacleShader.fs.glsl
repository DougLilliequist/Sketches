precision highp float;

uniform sampler2D tMatMap;
uniform sampler2D tColors;
uniform sampler2D tShadow;
uniform sampler2D tBlueNoise;

uniform vec3 cameraPosition;
uniform float uShadowTexelSize;

uniform float uTime;

varying vec3 vPos;
varying vec3 vMvPos;

varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vVelocity;
varying vec4 vData;
varying vec4 vShadowCoord;
varying vec3 vWorldNormal;


varying vec2 vUv;

vec2 matcap(vec3 eye, vec3 normal) {
    vec3 reflected = reflect(eye, normal);
    float m = 2.8284271247461903 * sqrt(reflected.z + 1.0);
    return reflected.xy / m + 0.5;
}

float unpackRGBA (vec4 v) {
    return dot(v, 1.0 / vec4(1.0, 255.0, 65025.0, 16581375.0));
}

float sampleShadow(vec2 coord, float depth) {

    float occlusion = unpackRGBA(texture2D(tShadow, coord));
    if(occlusion < depth -  0.0001) return 0.0;
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
            vec2 jitter = (texture2D(tBlueNoise, (gl_FragCoord.xy + offset)/256.0).xy * 2.0 - 1.0);
            totalShadow += sampleShadow(coord.xy + (offset + jitter) * uShadowTexelSize, coord.z);

        }
    }

    totalShadow /= 9.0;

    return totalShadow;
}

void main() {

    vec3 eye = normalize(cameraPosition - vPos);
    vec3 light = vec3(0.0, 10.0, 0.0);
    vec3 lightDir = normalize(light);
//    vec3 halfV = normalize(lightDir + eye);

    float halfLambert = dot(lightDir, normalize(vWorldNormal)) * 0.5 + 0.5;
//    float spec = pow(max(0.0, dot(halfV, vNormal)), 24.0);

    float ambientLight = vNormal.y * 0.5 + 0.5;

    vec3 viewDir = normalize(vMvPos.xyz);
    vec2 matcapCoord = matcap(viewDir, vViewNormal);
    vec3 matcapLight = texture2D(tMatMap, matcapCoord).yyy;
//    matcapLight = pow(matcapLight, 1.0);


    vec3 totalLight = halfLambert * 0.4 + ambientLight * 0.4 + matcapLight * 0.2;
    float shadow = calcShadow(vShadowCoord);
    totalLight *= mix(shadow, 1.0, 0.25);

//    float velocityPhase = dot(vVelocity, vVelocity) / (7.0 * 7.0);
    float velocityPhase = length(vVelocity) / 5.0;

    float targetPhase = 1.0 - abs(fract((uTime * mix(0.1, 1.0, vData.y)) + velocityPhase * 0.5) - vUv.x);
    targetPhase = pow(targetPhase, 2.0);
    targetPhase = smoothstep(0.0, 1.0, targetPhase);

    vec3 col = mix(vec3(0.93), clamp(vec3(0.1, 0.3, 0.98) + (velocityPhase*1.0), 0.0, 1.0), targetPhase);


    col *= totalLight;

    gl_FragColor = vec4(col, 1.0);
//    gl_FragColor = vec4(vec3(velocityPhase), 1.0);

}
