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
varying vec3 vNoise;
varying float vTarget;

// #define EPS 0.0005
// #define EPS 0.0005
#define EPS 0.001

// #define SPATIALF 18.123523
// #define SPATIALF 11.123523
// #define SPATIALF 34.123523
// #define SPATIALF 1.123523
#define SPATIALF 3.723523
// #define SPATIALF 17.345343
#define TEMPORALF 0.7
#define AMP 0.07
#define OCTAVES 4
// #define FALLOFF .731513
#define FALLOFF 0.824
// #define FALLOFF 0.524
// #define FALLOFF 1.0

// #define SPATIALF 4.123523
// // #define SPATIALF 17.345343
// #define TEMPORALF 0.4
// #define AMP 1.5
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
        // noise += sin(st.xyz*f)*a;
        noise += sin(st.zxy*f)*a;
        // noise += sin(st.yzx*f)*a;
        // st += (_Time * TEMPORALF*0.125);
        st += noise;

        //  a *= FALLOFF;
        //  f /= FALLOFF;
    }
    return noise;
}

//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  { 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
  }

  //test this
  //http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts

  mat2 rotate2D(float a) {

    return mat2(cos(a), -sin(a), sin(a), cos(a));

  }

void main() {

    vec3 pos = position;
    vec3 tan = tangent;
    vec3 norm = normal;
    // vec3 biNormal = normalize(cross(tan, norm));
    vec3 biNormal = binormal;

    // vec3 target = vec3(0.0, 0.0, 1.0) - pos;
    // float dist = length(target);
    // float phase = 1.0-abs(fract(_Time*.1)*2.0 - dist);
    // phase = cos(phase*4.0);
    // phase = pow(phase, 8.0);

    vTarget = 0.0;

    // pos += normal * phase * .1;
    
    vec3 up = pos + (biNormal * EPS);
    vec3 down = pos + (biNormal * -EPS);
    vec3 forward = pos + (tan * EPS);
    vec3 back = pos + (tan * -EPS);

    // float revealDirection = dot(normalize(vec3(cos(_Time) * sin(_Time * 0.5), sin(_Time * 0.5), sin(_Time) * sin(_Time*0.5))), normal) * 0.5+0.5;
    // revealDirection = revealDirection*revealDirection*revealDirection;
    float amp = mix(0.0, AMP, 1.0);

    vec3 noise = (sinNoise33((pos*SPATIALF) + (_Time * TEMPORALF))*0.5+0.5) * amp;
    vec3 noiseUp = (sinNoise33(up*SPATIALF+ (_Time * TEMPORALF))*0.5+0.5) * amp;
    vec3 noiseDown = (sinNoise33(down*SPATIALF+ (_Time * TEMPORALF))*0.5+0.5) * amp;
    vec3 noiseforward = (sinNoise33(forward*SPATIALF+(_Time * TEMPORALF))*0.5+0.5) * amp;
    vec3 noiseback = (sinNoise33(back*SPATIALF+(_Time * TEMPORALF))*0.5+0.5) * amp;

    // pos += noise;
    // up += noiseUp;
    // down += noiseDown;
    // forward += noiseforward;
    // back += noiseback;

    pos += noise;
    up += noiseUp;
    down += noiseDown;
    forward += noiseforward;
    back += noiseback;

    // float noise = (snoise((pos*SPATIALF) + (_Time * TEMPORALF))*0.5+0.5) * AMP;
    // float noiseUp = (snoise(up*SPATIALF+ (_Time * TEMPORALF))*0.5+0.5) * AMP;
    // float noiseDown = (snoise(down*SPATIALF+ (_Time * TEMPORALF))*0.5+0.5) * AMP;
    // float noiseforward = (snoise(forward*SPATIALF+(_Time * TEMPORALF))*0.5+0.5) * AMP;
    // float noiseback = (snoise(back*SPATIALF+(_Time * TEMPORALF))*0.5+0.5) * AMP;

    // pos += (pos) * noise;
    // up += (up) * noiseUp;
    // down += (down) * noiseDown;
    // forward += (forward) * noiseforward;
    // back += (back) * noiseback;

    // vec3 tangentGrad = normalize((pos-back) + (forward-pos));
    // vec3 biNormalGrad = normalize((pos-down) + (up-pos));

    vec3 tangentGrad = normalize((forward) - (back));
    vec3 biNormalGrad = normalize((up) - (down));

    //vec3 noisyNormal = (cross(tangentGrad, biNormalGrad));
    vec3 noisyNormal = normalize(cross(tangentGrad, biNormalGrad));
    // vec3 noisyNormal = (cross(tangentGrad, biNormalGrad));
    
    vNormal = normalMatrix * normalize(noisyNormal);
    vTangent = tangent;
    vUv = uv;
    vMvPos = modelViewMatrix * vec4(pos, 1.0);
    vPos = pos;
    vNoise = vec3(noise);

    gl_Position = projectionMatrix * vMvPos;

}
`