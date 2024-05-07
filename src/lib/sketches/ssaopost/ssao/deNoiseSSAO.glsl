#version 300 es
precision highp float;

uniform sampler2D tAoDepth;
uniform vec2 uDirection;

uniform float uDepthSigma;
uniform float uSigma;

uniform vec2 uResolution;
uniform float uNear;
uniform float uFar;

in vec2 vUv;
out vec4 FragColor;

#define TAU 3.14159265359 * 2.0
#define KERNEL_SIZE 7.0

float gaussianWeight(float x, float sigma) {
    float sigmaPow2 = sigma * sigma;
    float denom = (TAU * sigmaPow2);
    float exponent = (x * x) / (2.0 * sigmaPow2);
    return (1.0 / denom) * exp(-exponent);
}

void bilateralBlur(in float x, in float neighbour, in float p, in float q, inout float _totalIntensity, inout float _totalWeight) {

    float spatialWeight = gaussianWeight(x, uSigma);
    float depthDelta = (uFar - uNear) * abs(p - q);

    //looked horrible - but after plotting the function, the depth sigma needs to be tiny
    float rangeWeight = gaussianWeight(depthDelta, uDepthSigma * 0.001);

    float w = spatialWeight * rangeWeight;
    _totalIntensity += neighbour * w;
    _totalWeight += w;

}

void main() {

    float totalWeight = 0.0;
    float totalIntensity = 0.0;

    vec2 coord = gl_FragCoord.xy;
    vec2 aoDepth = texelFetch(tAoDepth, ivec2(coord), 0).xy;

    if(abs(aoDepth.y) >= 1.0) {
        FragColor = vec4(aoDepth, 0.0, 1.0);
        return;
    }

    float weight = gaussianWeight(0.0,  uSigma);
    totalIntensity += aoDepth.x * weight;
    totalWeight += weight;

    //double loop to prevent 14 branches per pixel

    for(float i = -KERNEL_SIZE; i < 0.0; i++) {
        vec2 offset = uDirection * i;
        vec2 nighbourCoord = gl_FragCoord.xy + offset;
        float neighbourAo = texture(tAoDepth, (nighbourCoord / uResolution)).x;
        float neighbourDepth = texelFetch(tAoDepth, ivec2(nighbourCoord), 0).y;
        bilateralBlur(i, neighbourAo, aoDepth.y, neighbourDepth, totalIntensity, totalWeight);
    }

    for(float i = 1.0; i <= KERNEL_SIZE; i++) {
        vec2 offset = uDirection * i;
        vec2 nighbourCoord = gl_FragCoord.xy + offset;
        float neighbourAo = texture(tAoDepth, (nighbourCoord / uResolution)).x;
        float neighbourDepth = texelFetch(tAoDepth, ivec2(nighbourCoord), 0).y;
        bilateralBlur(i, neighbourAo, aoDepth.y, neighbourDepth, totalIntensity, totalWeight);
    }

    totalIntensity /= totalWeight;
    FragColor = vec4(totalIntensity, aoDepth.y, 0.0, 1.0);

}
