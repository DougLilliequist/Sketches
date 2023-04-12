precision mediump float;

uniform sampler2D tMap;

varying vec2 vUv;

void main() {

    vec2 res = texture2D(tMap, vUv).xy;
//    res = res * 2.0 - 1.0;
    float dist = length((res * 2.0 - 1.0) - (vUv * 2.0 - 1.0));
    vec2 dir = normalize((res * 2.0 - 1.0) - (vUv * 2.0 - 1.0));
    gl_FragColor = vec4(dir, dist, 1.0);
//    gl_FragColor = vec4(res, dist, 1.0);
}
