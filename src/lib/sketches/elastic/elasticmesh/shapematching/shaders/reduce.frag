#version 300 es
precision highp float;

uniform sampler2D tMap;
uniform float uResolution; //previous mip resolution;

in vec2 vUv;
out vec4 FragColor;

void main() {

    float currentMipRes = uResolution * 0.5;
    vec2 coord = floor(vUv * currentMipRes) / currentMipRes;
    float stpSize = 1.0 / uResolution;

    vec4 a = texture(tMap, coord);
    vec4 b = texture(tMap, coord + vec2(stpSize, 0.0));
    vec4 c = texture(tMap, coord + vec2(0.0, stpSize));
    vec4 d = texture(tMap, coord + vec2(stpSize));

    FragColor = a + b + c + d;

}
