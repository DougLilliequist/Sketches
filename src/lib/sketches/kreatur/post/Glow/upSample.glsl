precision highp float;

uniform sampler2D tMap;
uniform sampler2D tNext;
uniform vec2 uTexelSize;
uniform float uAdd;

varying vec2 vUv;

void main() {

    float x = uTexelSize.x;
    float y = uTexelSize.y;

    vec3 upSample = vec3(0.0);

    // Take 9 samples around current texel:
    // a - b - c
    // d - e - f
    // g - h - i
    // === ('e' is the current texel) ===
    vec3 a = texture2D(tMap, vec2(vUv.x - x, vUv.y + y)).rgb;
    vec3 b = texture2D(tMap, vec2(vUv.x,     vUv.y + y)).rgb;
    vec3 c = texture2D(tMap, vec2(vUv.x + x, vUv.y + y)).rgb;

    vec3 d = texture2D(tMap, vec2(vUv.x - x, vUv.y)).rgb;
    vec3 e = texture2D(tMap, vec2(vUv.x,     vUv.y)).rgb;
    vec3 f = texture2D(tMap, vec2(vUv.x + x, vUv.y)).rgb;

    vec3 g = texture2D(tMap, vec2(vUv.x - x, vUv.y - y)).rgb;
    vec3 h = texture2D(tMap, vec2(vUv.x,     vUv.y - y)).rgb;
    vec3 i = texture2D(tMap, vec2(vUv.x + x, vUv.y - y)).rgb;

    // Apply weighted distribution, by using a 3x3 tent filter:
    //  1   | 1 2 1 |
    // -- * | 2 4 2 |
    // 16   | 1 2 1 |
    upSample = e*4.0;
    upSample += (b+d+f+h)*2.0;
    upSample += (a+c+g+i);
    upSample *= 1.0 / 16.0;

    vec3 next = texture2D(tNext, vUv).xyz * uAdd;

    gl_FragColor = vec4(upSample + next, 1.0);
}
