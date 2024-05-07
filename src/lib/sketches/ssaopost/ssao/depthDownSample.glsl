#version 300 es
precision highp float;

uniform sampler2D tDepth;

out vec4 FragColor;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
}

void main() {

    vec2 coord = gl_FragCoord.xy;

    vec2 bl = coord;
    vec2 br = coord + vec2(1.0, 0.0);
    vec2 tl = coord + vec2(0.0, 1.0);
    vec2 tr = coord + vec2(1.0, 1.0);

    float depthA = texelFetch(tDepth, ivec2(bl), 0).x;
    float depthB = texelFetch(tDepth, ivec2(br), 0).x;
    float depthC = texelFetch(tDepth, ivec2(tl), 0).x;
    float depthD = texelFetch(tDepth, ivec2(tr), 0).x;

    float maxDepth = min(min(depthA, depthB), min(depthC, depthD));

    FragColor = vec4(LinearizeDepth(maxDepth));

}
