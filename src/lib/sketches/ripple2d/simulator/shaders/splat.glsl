precision highp float;

uniform sampler2D tA;
uniform vec2 uInputPos;
uniform vec3 uInput;
uniform float uDt;
uniform float uStep;
uniform float uRadius;
uniform vec2 uAspect;
uniform float uInputMag;

varying vec2 vUv;

void main() {

    vec3 u = texture2D(tA, vUv).xyz;
    vec2 dir = uInputPos - vUv;
//    dir.x *= uAspect.x;

    float inputPhase = max(0.0, smoothstep(0.0, 1.0, uInputMag));
    float mag = exp(-dot(dir, dir) / (uRadius * inputPhase));
    u += uInput * mag * uDt;
//    u += smoothstep(1.0, 0.9, length(dir)*100.0) * inputPhase;

    gl_FragColor = vec4(u, 1.0);

}
