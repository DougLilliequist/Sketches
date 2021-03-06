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
    float lNW = dot(texture2D(tex, uv + vec2(-1, -1) * pixel).rgb, l);
    float lNE = dot(texture2D(tex, uv + vec2( 1, -1) * pixel).rgb, l);
    float lSW = dot(texture2D(tex, uv + vec2(-1,  1) * pixel).rgb, l);
    float lSE = dot(texture2D(tex, uv + vec2( 1,  1) * pixel).rgb, l);
    float lM  = dot(texture2D(tex, uv).rgb, l);
    float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
    float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));

    vec2 dir = vec2(
    -((lNW + lNE) - (lSW + lSE)),
    ((lNW + lSW) - (lNE + lSE))
    );

    float dirReduce = max((lNW + lNE + lSW + lSE) * 0.03125, 0.0078125);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(8, 8), max(vec2(-8, -8), dir * rcpDirMin)) * pixel;


    //the inclusion of alpha is based on THREE's take on FXAA
    //https://github.com/assiprinz/threejs-unreal-post/blob/master/js/shaders/FXAAShader.js
    vec4 rgbA = 0.5 * (
    texture2D(tex, uv + dir * (1.0 / 3.0 - 0.5)) +
    texture2D(tex, uv + dir * (2.0 / 3.0 - 0.5)));
    vec4 rgbB = rgbA * 0.5 + 0.25 * (
    texture2D(tex, uv + dir * -0.5) +
    texture2D(tex, uv + dir * 0.5));
    float lB = dot(rgbB, vec4(l, 0.0));
    return mix(
    vec4(rgbB),
    vec4(rgbA),
    max(sign(lB - lMin), 0.0) * max(sign(lB - lMax), 0.0)
    );
}
void main() {
    vec4 aa = fxaa(tMap, vUv, _Resolution);
    gl_FragColor = aa;
}