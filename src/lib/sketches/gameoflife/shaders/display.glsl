precision highp float;

uniform sampler2D tMap;

varying vec2 vUv;

void main() {

    float result = texture2D(tMap, vUv).x;
    gl_FragColor = vec4(vec3(result), 1.0);

}
