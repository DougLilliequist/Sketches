precision highp float;

varying vec3 vNormal;

#define LIGHTPOS vec3(1.0, 1.0, 1.0)

void main() {

    vec3 col = vec3(1.0);

    float halfLambert = dot((vNormal), normalize(LIGHTPOS)) * 0.5 + 0.5;


    gl_FragColor = vec4(mix(vec3(0.0), vec3(0.0, 0.0, 1.0), halfLambert), 1.0);

}
