precision highp float;

uniform sampler2D _Pass;
varying vec2 vUv;

void main() {

    vec4 col = texture2D(_Pass, vUv);
    gl_FragColor = col;

}