precision highp float;

uniform sampler2D tDiffusion;
uniform sampler2D tDiffusionPrev;
uniform sampler2D tMap;
uniform float uStep;
uniform float uDt;

varying vec2 vUv;

vec2 getGradient(sampler2D diffuse) {

    float l = texture2D(diffuse, vUv + vec2(uStep * 2.0, 0.0)).y;
    float r = texture2D(diffuse, vUv + vec2(-uStep* 2.0, 0.0)).y;
    float t = texture2D(diffuse, vUv + vec2(0.0, uStep* 2.0)).y;
    float b = texture2D(diffuse, vUv + vec2(0.0, -uStep* 2.0)).y;

    float dX = (l - r) * 0.5;
    float dY = (t - b) * 0.5;

    return vec2(dX, dY);

}

void main() {

    vec2 diffuseGradientCurrent = 1.0*getGradient(tDiffusion);
    vec2 diffuseGradientPrev = getGradient(tDiffusionPrev);

    float dist = length(diffuseGradientCurrent);
    float div = (diffuseGradientCurrent.x + diffuseGradientCurrent.y)*0.5;

    float r = texture2D(tMap, vUv + diffuseGradientCurrent + vec2(dist * 0.115, 0.0)).x;
    float g = texture2D(tMap, vUv + diffuseGradientCurrent + vec2(0.0, div * 0.125)).y;
    float b = texture2D(tMap, vUv + diffuseGradientCurrent + vec2(-dist * 0.115, 0.0)).z;

    vec2 vel = vec2(diffuseGradientCurrent - diffuseGradientPrev)/uDt;

//    gl_FragColor = vec4(vec3(texture2D(tDiffusion, vUv).x), 1.0);
    gl_FragColor = vec4(vec3(r,g,b), 1.0);
//    gl_FragColor = vec4(vec3(diffuseGradientCurrent.x), 1.0);

}
