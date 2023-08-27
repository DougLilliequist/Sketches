precision highp float;

uniform sampler2D tU;
uniform vec2 uInputPos;
uniform vec3 uInput;
uniform float uDt;
uniform float uStep;
uniform float uRadius;
uniform vec2 uAspect;
uniform float uInputMag;
uniform float uTime;

varying vec2 vUv;

void main() {

    vec3 u = texture2D(tU, vUv).xyz;
    vec2 dir = uInputPos - vUv;
    dir.x *= uAspect.x;

    float inputPhase = max(0.00001, smoothstep(0.0, 1.0, uInputMag));
    float mag = exp(-dot(dir, dir) / (uRadius * inputPhase));
//    u += (uInput * 0.5 + normalize(vec3(-dir, 0.0))*length(uInput)) * mag * uDt;
    u += uInput * mag * uDt * 1.0;

    gl_FragColor = vec4(u, 1.0);

}
