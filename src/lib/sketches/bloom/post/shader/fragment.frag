precision highp float;

uniform sampler2D _FxaaPassOutput;
uniform sampler2D _BlooomPassOutput;

uniform float _Time;

varying vec2 vUv;

vec3 hash32(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

vec3 screenBlend(vec3 a, vec3 b) {

    return 1.0 - ((1.0 - a) * (1.0 - b));

}

void main() {

    vec3 fxaaPass = texture2D(_FxaaPassOutput, vUv).xyz;
    vec3 bloomPass = texture2D(_BlooomPassOutput, vUv).xyz;

    vec3 finalCol = screenBlend(fxaaPass, bloomPass);

    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1300.0);
    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1300.0);
    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;

    gl_FragColor = vec4(finalCol + dither, 1.0);

}