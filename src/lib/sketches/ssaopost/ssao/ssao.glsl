#version 300 es
precision highp float;

uniform sampler2D tDepth;
uniform sampler2D tDepthLinear;
uniform sampler2D tNormal;

uniform mat4 projectionMatrix;
uniform vec2 uFrustum;

uniform float uSampleRadius;
uniform float uBias;
uniform float uIntensity;
uniform float uContrast;
uniform float uProjectionScale;
uniform float uSamples;
uniform float uTau;

uniform float uNear;
uniform float uFar;
uniform vec2 uResolution;
uniform float uHalfRes;
uniform float uDebug;

in vec2 vUv;
out vec4 FragColor;

#define PI 3.14159265359
#define TAU 3.14159265359 * 2.0

float hash(in vec2 c) {
    ivec2 iC = ivec2(c);
    return float(3 * iC.x ^ iC.y + iC.x * iC.y * 1);
}

float hash(in ivec2 c) {
    return float(3 * c.x ^ c.y + c.x * c.y * 1);
}

float linearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
}

vec3 computeEyePos(vec2 c, float z) {
    vec2 normC = 2.0 * ((c + 0.5) / uResolution) - 1.0;
    return vec3(normC * uFrustum * z, z * (uNear - uFar));
}

void main() {

    vec2 coord = gl_FragCoord.xy;

    float depthDenom = 1.0 / (uFar - uNear);
    float depth = texelFetch(tDepthLinear, ivec2(coord), 0).x * depthDenom;

    if(abs(depth) >= 1.0) {
        FragColor = vec4(1.0, depth, 0.0, 1.0);
        return;
    }

    vec3 viewPos = computeEyePos(coord, depth);

    vec3 normal;

    if(uHalfRes < 0.5) {

        normal = texelFetch(tNormal, ivec2(coord), 0).xyz;

    } else {

        vec2 depthCoord = floor(coord * 2.0);
        vec2 coords[4];

        coords[0] = depthCoord;
        coords[1] = depthCoord + vec2(1.0, 0.0);
        coords[2] = depthCoord + vec2(0.0, 1.0);
        coords[3] = depthCoord + vec2(1.0, 1.0);

        float depthA = linearizeDepth(texelFetch(tDepth, ivec2(coords[0]), 0).x) * depthDenom;
        float depthB = linearizeDepth(texelFetch(tDepth, ivec2(coords[1]), 0).x) * depthDenom;
        float depthC = linearizeDepth(texelFetch(tDepth, ivec2(coords[2]), 0).x) * depthDenom;
        float depthD = linearizeDepth(texelFetch(tDepth, ivec2(coords[3]), 0).x) * depthDenom;

        float minDist = 9999.0;
        vec2 desiredCoord;

        float dists[4];
        dists[0] = abs(depthA - depth);
        dists[1] = abs(depthB - depth);
        dists[2] = abs(depthC - depth);
        dists[3] = abs(depthD - depth);

        for(int i = 0; i < 4; i++) {
            if(dists[i] < minDist) {
                minDist = dists[i];
                desiredCoord = coords[i];
            }
        }
        normal = texelFetch(tNormal, ivec2(desiredCoord), 0).xyz;
    }

    float sampleRadius = (-uProjectionScale * uSampleRadius) / viewPos.z;
    float r2 = uSampleRadius * uSampleRadius;

    float _hash = hash(coord);

    float sum = 0.0;
    for(float i = 0.0; i < uSamples; i++) {

        float alpha = (1.0 / uSamples) * (i + 0.5);
        float hPrime = sampleRadius * alpha;

        float theta = (TAU * alpha * uTau) + _hash;
        vec2 offset = vec2(cos(theta), sin(theta))*hPrime;
        vec2 otherCoord = coord + offset;

        float sampledDepth = texelFetch(tDepthLinear, ivec2(otherCoord), 0).x * depthDenom;
        vec3 otherPos = computeEyePos(vec2(otherCoord), sampledDepth);

        vec3 delta = otherPos - viewPos;
        float deltaDotNorm = dot(delta, normal) * uDebug;
        float denom = dot(delta, delta) * uDebug;

        float bias = uBias * -viewPos.z * 0.01;
        float eps = 0.01;

        float f = max(0.0, r2 - denom);
        sum += f * f * f * max(0.0, (deltaDotNorm - bias) / (denom + eps));

    }

    float occlusion = pow(max(0.0, 1.0 - (((2.0 * uIntensity) / uSamples) * sum)), uContrast);
    FragColor = vec4(occlusion, depth, 0.0, 1.0);

}
