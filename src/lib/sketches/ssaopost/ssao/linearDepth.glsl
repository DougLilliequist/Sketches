#version 300 es
precision highp float;

uniform sampler2D tDepth;
uniform vec2 uResolution;

uniform float uNear;
uniform float uFar;

uniform float uDownSample;

in vec2 vUv;
out vec4 FragColor;

//#define CHECKERBOARD_PATTERN

float linearizeDepth(float depth)
{
        float z = depth * 2.0 - 1.0; // back to NDC
        return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
}

void main() {

    vec2 coord = gl_FragCoord.xy;
    float depth;

    if(uDownSample < 0.5) {

        depth = texelFetch(tDepth, ivec2(coord), 0).x;

    } else {

        coord = floor(vUv * uResolution*2.0);
        vec2 bl = coord;
        vec2 br = coord + vec2(1.0, 0.0);
        vec2 tl = coord + vec2(0.0, 1.0);
        vec2 tr = coord + vec2(1.0, 1.0);

        float depthA = texelFetch(tDepth, ivec2(bl), 0).x;
        float depthB = texelFetch(tDepth, ivec2(br), 0).x;
        float depthC = texelFetch(tDepth, ivec2(tl), 0).x;
        float depthD = texelFetch(tDepth, ivec2(tr), 0).x;

        depth = max(max(depthA, depthB), max(depthC, depthD));

        #ifdef CHECKERBOARD_PATTERN
            float minDepth = min(min(depthA, depthB), min(depthC, depthD));
            depth = mix(depth, minDepth, float(int(coord.x) & 1 * int(coord.y) & 1));
        #endif

    }

    depth = linearizeDepth(depth);

    FragColor = vec4(depth);
}
