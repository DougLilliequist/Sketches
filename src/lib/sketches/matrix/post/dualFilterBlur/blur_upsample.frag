precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 uResolution;

uniform float uStepSize;
uniform float uTime;

uniform float uSeed;

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

void main() {

    vec2 texelSize = 1.0 / uResolution;

    vec2 texelSizeHalf = texelSize * 0.5;

    vec3 col = texture2D(tDiffuse, vUv + vec2(-texelSizeHalf.x * 2.0, 0.0)).xyz;
    col += texture2D(tDiffuse, vUv + vec2(-texelSizeHalf.x, texelSizeHalf.y)).xyz * 2.0;
    col += texture2D(tDiffuse, vUv + vec2(0.0, texelSizeHalf.y * 2.0)).xyz;
    col += texture2D(tDiffuse, vUv + vec2(texelSizeHalf.x, texelSizeHalf.y)).xyz * 2.0;
    col += texture2D(tDiffuse, vUv + vec2(texelSizeHalf.x * 2.0, 0.0)).xyz;
    col += texture2D(tDiffuse, vUv + vec2(texelSizeHalf.x, -texelSizeHalf.y)).xyz * 2.0;
    col += texture2D(tDiffuse, vUv + vec2(0.0, -texelSizeHalf.y * 2.0)).xyz;
    col += texture2D(tDiffuse, vUv + vec2(-texelSizeHalf.x, -texelSizeHalf.y)).xyz * 2.0;

    col /= 12.0;

//    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1351.0 + _Seed);
//    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1713.0 + _Seed);
//    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;

    // Output to screen
    gl_FragColor = vec4(col,1.0);

}
