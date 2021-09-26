precision highp float;

varying vec3 vNormal;

#define LIGHT vec3(0.0, 1.0, 1.0)

void main() {

    vec3 col = vNormal * 0.5 + 0.5;

    float light = dot(normalize(LIGHT), vNormal) * 0.5 + 0.5;

    gl_FragColor = vec4(vec3(light), 1.0);

}
