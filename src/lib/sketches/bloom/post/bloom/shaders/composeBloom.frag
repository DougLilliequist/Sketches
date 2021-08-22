precision highp float;

uniform sampler2D _NarrowBlur;
uniform sampler2D _WideBlur;
uniform sampler2D _Emissive;

varying vec2 vUv;

#define NARROW_GLOW_INTENSITY 1.0

vec3 screenBlend(vec3 a, vec3 b) {

    return 1.0 - ((1.0 - a) * (1.0 - b));

}

void main() {

    vec3 narrowBloom = texture2D(_NarrowBlur, vUv).xyz * 1.0;
    vec3 wideBloom = texture2D(_WideBlur, vUv).xyz;
    vec3 emissive = texture2D(_Emissive, vUv).xyz * 1.0;

    vec3 finalBloom = wideBloom+narrowBloom;

    gl_FragColor = vec4(finalBloom, 1.0);

}