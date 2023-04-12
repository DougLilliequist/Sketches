precision highp float;

uniform sampler2D tW;

varying vec2 vUv;

void main() {

    float w = texture2D(tW, vUv).x;
    w *= 0.0;

    gl_FragColor = vec4(w, 0.0, 0.0, 1.0);
}
