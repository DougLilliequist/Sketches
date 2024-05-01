#version 300 es
precision highp float;

uniform sampler2D tMatMap;
uniform sampler2D tColors;
uniform sampler2D tShadow;
uniform sampler2D tBlueNoise;

uniform vec3 cameraPosition;
uniform float uShadowTexelSize;

uniform float uTime;

in vec3 vPos;
in vec3 vMvPos;

in vec3 vNormal;
in vec3 vViewNormal;
in vec3 vVelocity;
in vec4 vData;
in vec4 vShadowCoord;
in vec3 vWorldNormal;
in vec3 vUnNormalNormal;

in vec2 vUv;

out vec4 color[2];

vec3 sinNoise(vec3 seed, float fallOff, int octaves) {

    vec3 noise = vec3(0.0);

    float amp = 1.0;
    float freq = 1.0;

    vec3 s = seed;

    mat3 mat = mat3(0.563152, 0.495996, 0.660945, -0.660945, 0.750435, 0.0, -0.495996, -0.436848, 0.750435);

    for(int i = 0; i < octaves; i++) {
        s = mat * s.yzx;
        noise += sin(s.yzx * freq) * amp;
        amp *= fallOff;
        freq /= fallOff;
        s += noise;

    }

    return noise;
}


vec2 matcap(vec3 eye, vec3 normal) {
    vec3 reflected = reflect(eye, normal);
    float m = 2.8284271247461903 * sqrt(reflected.z + 1.0);
    return reflected.xy / m + 0.5;
}

float unpackRGBA (vec4 v) {
    return dot(v, 1.0 / vec4(1.0, 255.0, 65025.0, 16581375.0));
}

float sampleShadow(vec2 coord, float depth) {

    float occlusion = unpackRGBA(texture(tShadow, coord));
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
            vec2 jitter = (texture(tBlueNoise, (gl_FragCoord.xy + offset)/256.0).xy - 0.5);
            totalShadow += sampleShadow(coord.xy + (offset + jitter) * uShadowTexelSize, coord.z);

        }
    }

    totalShadow /= 9.0;

    return totalShadow;
}

void main() {

    vec3 eye = normalize(cameraPosition - vPos);
    vec3 light = vec3(3.0, 10.0, 5.0);
    vec3 lightDir = normalize(light);

    float halfLambert = dot(lightDir, vNormal) * 0.5 + 0.5;
    float ambientLight = vNormal.y * 0.5 + 0.5;

    vec3 viewDir = normalize(vMvPos.xyz);
    vec2 matcapCoord = matcap(viewDir, vViewNormal);
    vec3 matcapLight = texture(tMatMap, matcapCoord).xxx;

    vec3 totalLight = halfLambert * 0.85 + matcapLight * 0.15;
    float shadow = calcShadow(vShadowCoord);
    totalLight *= mix(shadow, 1.0, 0.25);

    float velocityPhase = length(vVelocity) / 30.0;
    velocityPhase = smoothstep(0.0, 1.0, velocityPhase);

    //add extra brightness based on the inverse of normals length (smaller radius = brighter, larger radius = dimmer)
    float normalLen = length(vUnNormalNormal);
    float radiusK = (1.0 / normalLen) * 0.001;

    vec3 sNoise = sinNoise((vPos * 3.0) + uTime * 0.25 + velocityPhase, 0.731, 4);
    sNoise = sNoise * 0.5 + 0.5;
    sNoise = mix(vec3(0.1, 0.3, 0.98), sNoise, 0.4 * ((sNoise.x + sNoise.y + sNoise.z) * 0.333));
    vec3 glowCol = clamp(sNoise + (velocityPhase*0.4), 0.0, 1.0);

    vec3 col = mix(vec3(0.88, 0.88, 0.93), glowCol, velocityPhase);
    col *= totalLight;

    color[0] = vec4(col, 1.0);
    color[1] = vec4(mix(vec3(0.0), glowCol, velocityPhase), 1.0);
}
