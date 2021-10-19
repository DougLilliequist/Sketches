precision highp float;

varying vec3 vNormal;
varying float vPhase;

#define LIGHT vec3(0.0, 1.0, 1.0)

void main() {

    vec3 col = vNormal * 0.5 + 0.5;

    float light = dot(normalize(LIGHT), vNormal) * 0.5 + 0.5;

    gl_FragColor = vec4(mix(vec3(0.865, 0.8, 0.1), vec3(0.985456, 0.98534, 0.0), light), 1.0);

}
