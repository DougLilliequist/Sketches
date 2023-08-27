precision mediump float;

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

uniform sampler2D tSSAO;
uniform sampler2D tSSAOPrev;
uniform float uSSAOIntensity;
uniform vec2 uResolution;

uniform float uTime;

varying vec2 vUv;

vec3 hash32(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

float getSSAO(in sampler2D ssao) {

    vec2 texelSize = 1.0 / uResolution;
    float sum = 0.0;

    sum += texture2D(ssao, vUv - texelSize).x * 0.0625;
    sum += texture2D(ssao, vUv + vec2(0.0, -texelSize.y)).x * 0.125;
    sum += texture2D(ssao, vUv + vec2(texelSize.x, -texelSize.y)).x * 0.0625;

    sum += texture2D(ssao, vUv - vec2(texelSize.x, 0.0)).x * 0.125;
    sum += texture2D(ssao, vUv).x * 0.25;
    sum += texture2D(ssao, vUv + vec2(texelSize.x, 0.0)).x * 0.125;

    sum += texture2D(ssao, vUv + texelSize).x * 0.0625;
    sum += texture2D(ssao, vUv + vec2(0.0, texelSize.y)).x * 0.125;
    sum += texture2D(ssao, vUv + vec2(-texelSize.x, texelSize.y)).x * 0.0625;

    return sum;

}

void main() {

    vec3 color = vec3(0.0);

    vec3 diffuse = texture2D(tDiffuse, vUv).xyz;
    float ssao = texture2D(tSSAO, vUv).x;
    //float ssao = getSSAO();

    //color = diffuse * (1.0 + (ssao - 1.0) * uSSAOIntensity);
    //color = diffuse * mix(getSSAO(tSSAO), getSSAO(tSSAOPrev), 0.9997);
    //color = diffuse * getSSAO(tSSAO);
    color = diffuse * getSSAO(tSSAO);

    //step(x, n): if x > n
//    color = mix(color, diffuse * getSSAO(), step(vUv.x, 0.5));
//    color = diffuse;

    vec3 hash1 = hash32(gl_FragCoord.xy+fract(uTime)*1300.0 * 150.0);
    vec3 hash2 = hash32(gl_FragCoord.yx+fract(uTime+0.3123)*1300.0 * 137.0);
    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;

    gl_FragColor = vec4(color, 1.0);
//    gl_FragColor = vec4(vec3(getSSAO(tSSAO)), 1.0);

}
