#version 300 es
precision highp float;

uniform sampler2D tAoDepth;
uniform sampler2D tDepth;

uniform float uNear;
uniform float uFar;

uniform float uSurfaceThreshold;

in vec2 vUv;
out vec4 FragColor;

float linearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
}

void main() {

    vec2 coord = gl_FragCoord.xy;
    vec2 halfResCoord = floor(coord * 0.5);

    float depthDenom = 1.0 / (uFar - uNear);
    float depth = linearizeDepth(texelFetch(tDepth, ivec2(coord), 0).x) * depthDenom;

    vec2 bl = halfResCoord;
    vec2 br = halfResCoord + vec2(1.0, 0.0);
    vec2 tl = halfResCoord + vec2(0.0, 1.0);
    vec2 tr = halfResCoord + vec2(1.0, 1.0);

    vec2 aoDepthA = texelFetch(tAoDepth, ivec2(bl), 0).xy;
    vec2 aoDepthB = texelFetch(tAoDepth, ivec2(br), 0).xy;
    vec2 aoDepthC = texelFetch(tAoDepth, ivec2(tl), 0).xy;
    vec2 aoDepthD = texelFetch(tAoDepth, ivec2(tr), 0).xy;

    float dists[4];
    dists[0] = abs(aoDepthA.y - depth);
    dists[1] = abs(aoDepthB.y - depth);
    dists[2] = abs(aoDepthC.y - depth);
    dists[3] = abs(aoDepthD.y - depth);

    float aos[4];
    aos[0] = aoDepthA.x;
    aos[1] = aoDepthB.x;
    aos[2] = aoDepthC.x;
    aos[3] = aoDepthD.x;

    float outputSSAO = 0.0;

    //very small rate of change - assume all samples are on the same surface
    if(fwidth(dists[0]) < uSurfaceThreshold * 0.001) {
        vec2 fCoord = fract(coord + 0.5); //tmp fix for now with half pixel fudge
        float x1 = mix(aos[0], aos[1], fCoord.x);
        float x2 = mix(aos[2], aos[3], fCoord.x);
        outputSSAO = mix(x1, x2, fCoord.y);
    } else {

        float minDist = 9990.0;
        for(int i = 0; i < 3; i++) {
            if(dists[i] < minDist) {
                minDist = dists[i];
                outputSSAO = aos[i];
            }
        }

    }

    FragColor = vec4(outputSSAO, 0.0, 0.0, 1.0);

}
