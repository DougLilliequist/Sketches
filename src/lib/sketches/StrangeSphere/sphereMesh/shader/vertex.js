export const vertex = `
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 tangent;
attribute vec3 binormal;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

uniform float _Time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec4 vMvPos;
varying vec2 vMatcap;
varying vec3 vPos;

// #define EPS 0.0005
#define EPS 0.0005

#define SPATIALF 7.123523
// #define SPATIALF 17.345343
#define TEMPORALF 0.4
#define AMP 1.5
#define OCTAVES 5
#define FALLOFF 0.731513

// #define SPATIALF 4.123523
// // #define SPATIALF 17.345343
// #define TEMPORALF 0.4
// #define AMP 2.5
// #define OCTAVES 5
// #define FALLOFF 0.531513

#define m3 mat3(-0.73736, 0.45628, 0.49808, 0, -0.73736, 0.67549, 0.67549, 0.49808, 0.54371)
vec3 sinNoise33(vec3 st) {
    // st.z *= TEMPORALF;
    vec3 noise = vec3(0.0,0.0,0.0);
    float a = 1.0;
    float f = 1.0;
    for(int i = 0; i < OCTAVES; i++) {
        
        st = m3 * st;
        noise += sin(st.yzx*f)*a;
        st += (_Time * TEMPORALF*0.25);

        a *= FALLOFF;
        f /= FALLOFF;
    }
    return noise / 5.0;
}

void main() {

    vec3 pos = position;
    vec3 tan = tangent;
    vec3 norm = normal;
    // vec3 biNormal = normalize(cross(norm, tan));
    vec3 biNormal = binormal;
    
    vec3 up = pos + (biNormal * EPS);
    vec3 down = pos - (biNormal * EPS);
    vec3 left = pos + (tan * EPS);
    vec3 right = pos - (tan * EPS);

    vec3 noise = (sinNoise33((pos*SPATIALF))*0.5+0.5) * AMP;
    
    vec3 noiseUp = (sinNoise33(up*SPATIALF)*0.5+0.5) * AMP;
    vec3 noiseDown = (sinNoise33(down*SPATIALF)*0.5+0.5) * AMP;
    vec3 noiseLeft = (sinNoise33(left*SPATIALF)*0.5+0.5) * AMP;
    vec3 noiseRight = (sinNoise33(right*SPATIALF)*0.5+0.5) * AMP;

    pos += normalize(pos) * noise;
    up += normalize(up) * noiseUp;
    down += normalize(down) * noiseDown;
    left += normalize(left) * noiseLeft;
    right += normalize(right) * noiseRight;

    vec3 biNormalGrad = normalize(up - down);
    vec3 tangentGrad = normalize(left - right);

    vec3 noisyNormal = normalize(cross(tangentGrad, biNormalGrad));
    
    vNormal = normalMatrix * noisyNormal;
    vTangent = tangent;
    vUv = uv;
    vMvPos = modelViewMatrix * vec4(pos, 1.0);
    vPos = pos;

    gl_Position = projectionMatrix * vMvPos;

}
`