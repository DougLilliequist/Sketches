#version 300 es
precision highp float;

uniform sampler2D tDepth;
uniform sampler2D tDepthDown;
uniform sampler2D tNormal;

uniform vec2 uResolution;

uniform float uNear;
uniform float uFar;

in vec2 vUv;
out vec4 FragColor;

float linearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
}

void main() {

    vec2 coord = gl_FragCoord.xy;

    float depthDenom = 1.0 / (uFar - uNear);
    float depth = linearizeDepth(texelFetch(tDepthDown, ivec2(coord), 0).x) * depthDenom;

    vec2 depthCoord = vUv * uResolution*2.0;
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

    vec3 normal = texelFetch(tNormal, ivec2(desiredCoord), 0).xyz;

    FragColor = vec4(normal, 1.0);
}
