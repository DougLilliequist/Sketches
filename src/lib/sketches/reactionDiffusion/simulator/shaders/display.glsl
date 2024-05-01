precision highp float;

uniform sampler2D tDiffusion;
uniform sampler2D tDiffusionPrev;
uniform float uStep;
uniform float uDt;

varying vec2 vUv;

vec2 getGradient(sampler2D diffuse) {

    float l = texture2D(diffuse, vUv + vec2(uStep, 0.0)).y;
    float r = texture2D(diffuse, vUv + vec2(-uStep, 0.0)).y;
    float t = texture2D(diffuse, vUv + vec2(0.0, uStep)).y;
    float b = texture2D(diffuse, vUv + vec2(0.0, -uStep)).y;

    float dX = (l - r) * 0.5;
    float dY = (t - b) * 0.5;

    return vec2(dX, dY);

}

void main() {

    vec2 diffuseGradientCurrent = getGradient(tDiffusion);
    vec2 diffuseGradientPrev = getGradient(tDiffusionPrev);

    vec2 vel = vec2(diffuseGradientCurrent - diffuseGradientPrev)/uDt;

    gl_FragColor = vec4(vec3(vel*1.0, 0.0), 1.0);

    vec3 lightP = vec3(0.5, 1.0, 5.0);
    vec3 norm = vec3(diffuseGradientCurrent, 1.0);
    vec3 p = vec3(2.0 * vUv - 1.0, 0.0);

    float light = dot(normalize(lightP - p), normalize(norm))*0.5+0.5;
    light = pow(light, 8.0);

    gl_FragColor = vec4(vec3(light), 1.0);

}
