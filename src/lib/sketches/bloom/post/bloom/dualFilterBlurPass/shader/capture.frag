precision highp float;

uniform sampler2D _Pass;

varying vec2 vUv;

void main() {

    vec3 col = texture2D(_Pass, vUv).xyz;
    gl_FragColor = vec4(col, 1.0);

}