precision mediump float;

uniform sampler2D tMap;
uniform float uTime;

varying vec2 vUv;

void main() {

    vec3 res = texture2D(tMap, vUv).xyz;
//    float viz = abs(fract((fract(uTime) - res.x) * 10.0) * 2.0 - 1.0);
    float viz = abs(fract(fract(uTime - res.z) * 1.0) * 2.0 - 1.0);



    gl_FragColor = vec4(vec3(viz), 1.0);
    gl_FragColor = vec4(vec3(res.xy, 0.0)*.5+0.5, 1.0);
//    gl_FragColor = vec4(vec3(res.xy, 0.0), 1.0);
}
