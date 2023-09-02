precision highp float;

uniform sampler2D tMap;
uniform sampler2D _Base;
uniform sampler2D _Blur;
uniform sampler2D _Depth;

uniform float _Time;

varying vec2 vUv;

//https://www.geeks3d.com/20091216/geexlab-how-to-visualize-the-depth-buffer-in-glsl/
float LinearizeDepth(float depth) 
{
    float z = depth;
    return (2.0 * 0.1) / (100.0 + 0.1 - z * (100.0 - 0.1));
}

vec3 screenBlend(vec3 a, vec3 b) {

    return 1.0 - ((1.0 - a) * (1.0 - b));

}

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

void main() {

    vec3 layerA = texture2D(tMap, vUv).xyz;
    vec3 layerB = texture2D(_Blur, vUv).xyz;

    vec3 screen = screenBlend(layerA, layerB);

    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1300.0);
    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1300.0);
    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;

    gl_FragColor = vec4(screen + dither, 1.0);

}