precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 uTexelSize;

varying vec2 vUv;

void main() {

    vec2 stp = uTexelSize * 0.5;
    vec3 col = texture2D(tDiffuse, vUv + vec2(-stp.x, -stp.y)).xyz;
    col += texture2D(tDiffuse, vUv + vec2(stp.x, -stp.y)).xyz;
    col += texture2D(tDiffuse, vUv + vec2(-stp.x, stp.y)).xyz;
    col += texture2D(tDiffuse, vUv + vec2(stp.x, stp.y)).xyz;

    col *= 0.25;

    gl_FragColor = vec4(col, 1.0);

}
