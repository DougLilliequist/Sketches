precision highp float;
// Default uniform for previous pass is 'tMap'.
// Can change this using the 'textureUniform' property
// when adding a pass.
uniform sampler2D tMap;
uniform vec2 _Resolution;
varying vec2 vUv;

float luma(vec4 color) {
    return dot(color.xyz, vec3(0.299, 0.587, 0.114));
}

vec4 fxaa(sampler2D tex, vec2 uv, vec2 resolution) {
    vec2 pixel = vec2(1) / resolution;
    vec3 l = vec3(0.299, 0.587, 0.114);
    float lNW = dot(vec3(texture2D(tex, uv + vec2(-1, -1) * pixel).w), l);
    float lNE = dot(vec3(texture2D(tex, uv + vec2( 1, -1) * pixel).w), l);
    float lSW = dot(vec3(texture2D(tex, uv + vec2(-1,  1) * pixel).w), l);
    float lSE = dot(vec3(texture2D(tex, uv + vec2( 1,  1) * pixel).w), l);
    float lM  = dot(vec3(texture2D(tex, uv).w), l);
    float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
    float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));

    vec2 dir = vec2(
    -((lNW + lNE) - (lSW + lSE)),
    ((lNW + lSW) - (lNE + lSE))
    );

    float dirReduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(8, 8), max(vec2(-8, -8), dir * rcpDirMin)) * pixel;

    vec3 rgbA = 0.5 * (
    vec3(texture2D(tex, uv + dir * (1.0 / 3.0 - 0.5)).w) +
    vec3(texture2D(tex, uv + dir * (2.0 / 3.0 - 0.5)).w));
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
    vec3(texture2D(tex, uv + dir * -0.5).w) +
    vec3(texture2D(tex, uv + dir * 0.5).w));
    float lB = dot(rgbB, l);
    return mix(
    vec4(rgbB, 1),
    vec4(rgbA, 1),
    max(sign(lB - lMin), 0.0) * max(sign(lB - lMax), 0.0)
    );
}
void main() {
    vec4 aa = fxaa(tMap, vUv, _Resolution);
    gl_FragColor = aa;
}