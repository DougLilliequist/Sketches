export const blur_noDither = `

precision highp float;

uniform sampler2D _Image;
uniform vec2 _Resolution;

uniform float _StepSize;
uniform float _Time;

uniform float _Seed;

varying vec2 vUv;


float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec3 hash32(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

vec3 lin2srgb(vec3 c) {
    return sqrt(c);
}

vec3 srgb2lin(vec3 c) {
    return c * c;
}

void main() {
    
    vec2 texelSize = 1.0 / _Resolution;

    vec3 col = texture2D(_Image, vUv + texelSize * _StepSize).xyz;
    col += texture2D(_Image, vUv - texelSize * _StepSize).xyz;
    col += texture2D(_Image, vUv + vec2(texelSize.x, -texelSize.y) * _StepSize).xyz;
    col += texture2D(_Image, vUv + vec2(-texelSize.x, +texelSize.y) * _StepSize).xyz;
    col /= 8.0;

    // col = sqrt(col);
    // Output to screen
    gl_FragColor = vec4(col,1.0);

}

`