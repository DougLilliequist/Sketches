precision highp float;

uniform sampler2D tMap;
uniform sampler2D _PrevPos;

varying vec2 vUv;

void main() {

    gl_FragColor = texture2D(_PrevPos, vUv);

}
