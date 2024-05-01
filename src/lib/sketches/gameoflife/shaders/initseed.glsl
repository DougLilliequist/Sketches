precision highp float;

uniform sampler2D tPrev;
uniform float uTime;
uniform vec2 uResolution;

varying vec2 vUv;

float hash12(vec2 p)
{
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec3 sinNoise(vec3 seed, float fallOff, int octaves) {

    vec3 noise = vec3(0.0);

    float amp = 1.0;
    float freq = 1.0;

    vec3 s = seed;

    mat3 mat = mat3(0.563152, 0.495996, 0.660945, -0.660945, 0.750435, 0.0, -0.495996, -0.436848, 0.750435);

    for(int i = 0; i < 8; i++) {
        s = mat * s.yzx;
        noise += sin(s.yzx * freq) * amp;
        amp *= fallOff;
        freq /= fallOff;
        s += noise;

    }

    return noise;
}

void main() {

    float cells = texture2D(tPrev, vUv).x;
    vec2 floorc = floor(vUv * uResolution * 0.5) / (uResolution * 0.5);
    vec2 signedC = vUv - 0.5;
    float hash = pow(signedC.x, 2.0) * pow(signedC.y, 2.0);

    vec2 noiseCp = signedC;
//    noiseCp -= 0.5;
    noiseCp.x *= uResolution.x/uResolution.y;
//    noiseCp += 0.5;

    vec2 noiseC = floor(noiseCp * 16.0) / 16.0;
    vec3 noise = sinNoise(vec3(abs(noiseC), uTime * 0.15), .737, 4);
    float seed = dot(noise, vec3(0.333333));

    float x = length(signedC);
    float ripple = 1.0 - abs(fract(uTime) - x);
    ripple = smoothstep(0.9, 1.0, ripple);

    gl_FragColor = vec4(vec3(min(1.0, cells + step(abs(seed), 0.5))), 1.0);
    //gl_FragColor = vec4(vec3(min(1.0, cells + step(hash12(gl_FragCoord.xy), 0.9))), 1.0);
//    gl_FragColor = vec4(vec3(step(hash12(gl_FragCoord.xy*1000.0), 0.01)), 1.0);
//    gl_FragColor = vec4(vec3(step(vUv.x, 0.5) * step(0.499, vUv.x)), 1.0);
//    gl_FragColor = vec4(vec3(min(1.0, max(step(hash12(gl_FragCoord.xy+uTime*0.1), cells), 0.5))), 1.0);
    //gl_FragColor = vec4(vec3(max(cells, length(signedC))), 1.0);
//    gl_FragColor = vec4(vec3(max(step(hash12(gl_FragCoord.xy+uTime*0.1), 0.0001), cells)), 1.0);
}
