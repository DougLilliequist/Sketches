precision mediump float;

uniform sampler2D tPositions;
uniform sampler2D tNormals;
uniform sampler2D tDepth;

uniform sampler2D tNoise;
uniform float uNoiseRes;

uniform vec3 uSamplePoints[64];
uniform float uSampleRadius;
uniform float uBias;
uniform float uQuality;

uniform vec2 uResolution;
uniform float uTime;

uniform mat4 projectionMatrix;
uniform mat4 uInvProjMatrix;

varying vec2 vUv;

vec3 hash32(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

mat3 setupHemisphereBasis(in vec3 normal) {

    //tiled blue noise based vectors which are used to rotate the basis in random directions
//    vec3 randomVec = vec3(texture2D(tNoise, (gl_FragCoord.xy + mod(uTime*10.0, 256.0))/uNoiseRes).xy*2.0-1.0, 0.0);
    vec3 randomVec = vec3(texture2D(tNoise, (gl_FragCoord.xy + mod(uTime*100.0, 256.0))/uNoiseRes).xy*2.0-1.0, 0.0);
//    vec3 randomVec = vec3(texture2D(tNoise, (gl_FragCoord.xy)/uNoiseRes).xy*2.0-1.0, 0.0);

    vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
    vec3 biTangent = cross(normal, tangent);
    return mat3(tangent, biTangent, normal);
}

float calcOcclusion(vec3 normal, vec3 pos) {
    float occlusion = 0.0;
    for(int i = 0; i < 14; i++) {

        vec3 samplePos = setupHemisphereBasis(normal) * uSamplePoints[i];
        samplePos = pos + samplePos * uSampleRadius;

        vec4 offset = projectionMatrix * vec4(samplePos, 1.0);
        offset.xy /= offset.w;
        offset = offset * 0.5 + 0.5;

        //offset.xy = (floor(offset.xy * uResolution) + 0.5) / uResolution;

        float sampledDepth = texture2D(tPositions, offset.xy).z;
        float depthFix = smoothstep(0.0, 1.0, uSampleRadius / abs(sampledDepth - pos.z));

        if(sampledDepth >= samplePos.z + uBias) occlusion += 1.0 * depthFix; //might cause funky artefacts due to OGL's decisions on basis
    }

    return 1.0 - (occlusion / uQuality);
}

void main() {

    vec3 viewPos = texture2D(tPositions, vUv).xyz;
    vec3 normal = texture2D(tNormals, vUv).xyz;

    float occlusion = 1.0;

    if(dot(normal, normal) > 0.0) occlusion = calcOcclusion(normal, viewPos);

    gl_FragColor = vec4(vec3(occlusion), 1.0);
}
