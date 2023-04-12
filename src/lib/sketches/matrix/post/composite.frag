precision mediump float;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

uniform sampler2D tSSAO;
uniform float uSSAOIntensity;

uniform float uTime;

varying vec2 vUv;

vec3 hash32(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

void main() {

    vec3 color = vec3(0.0);

    vec3 diffuse = texture2D(tDiffuse, vUv).xyz;
    float ssao = texture2D(tSSAO, vUv).x;

    color = diffuse * (1.0 + (ssao - 1.0) * uSSAOIntensity);
//    color = diffuse;

    vec3 hash1 = hash32(gl_FragCoord.xy+fract(uTime)*1300.0 * 150.0);
    vec3 hash2 = hash32(gl_FragCoord.yx+fract(uTime+0.3123)*1300.0 * 137.0);
    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;

    gl_FragColor = vec4(color + dither, 1.0);

}
