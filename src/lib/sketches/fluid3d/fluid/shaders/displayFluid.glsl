precision highp float;

uniform sampler2D tFluid;
uniform float uStep;

varying vec2 vUv;

float hash12(vec2 p)
{
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {

//    float grain = mix(-2.0, 2.0, hash12(gl_FragCoord.xy)) / 255.0;
//
//    float L = texture2D(tFluid, vUv + vec2(uStep*2.5, 0.0)).x;
//    float R = texture2D(tFluid, vUv + vec2(-uStep*2.5, 0.0)).x;
//    float T = texture2D(tFluid, vUv + vec2(0.0, uStep*2.5)).x;
//    float B = texture2D(tFluid, vUv + vec2(0.0, -uStep*2.5)).x;
//
//    float dX = (L - R) * 10.0;
//    float dY = (T - B) * 10.0;
//
//    vec3 normal = normalize(vec3(dX, dY, length(vec2(dX, dY)+1.0)));
//    vec3 light = vec3(0.0, 1.0, 1.0);
//    vec3 eye = vec3(0.0, 0.0, 1.0);
//
//
//    vec3 pos = vec3(vUv + vec2(dX, dY), length(vUv + vec2(dX, dY)));
//
//    float nDotL = dot(normalize(eye - pos), normal) * 0.5 + (1.0 - 0.5);
//    vec3 col = mix(vec3(0.3, 0.4, 1.0), vec3(0.5, 0.61254, 1.0),texture2D(tFluid, vUv).x);
//
//
//    gl_FragColor = vec4(col, 1.0);
//
    vec3 fluid = texture2D(tFluid, vUv).xyz;
    vec3 col = mix(vec3(0.93), fluid, length(fluid));

        float L = texture2D(tFluid, vUv + vec2(uStep*0.5, 0.0)).x;
        float R = texture2D(tFluid, vUv + vec2(-uStep*0.5, 0.0)).x;
        float T = texture2D(tFluid, vUv + vec2(0.0, uStep*0.5)).x;
        float B = texture2D(tFluid, vUv + vec2(0.0, -uStep*0.5)).x;

//    gl_FragColor = vec4(texture2D(tFluid, vUv).xyz , 1.0);
//    gl_FragColor = vec4(smoothstep(0.0, 1.0, (L + R + T + B) * 0.25) , 1.0);
    gl_FragColor = vec4(vec3((L + R + T + B) * 0.25), 1.0);


}
