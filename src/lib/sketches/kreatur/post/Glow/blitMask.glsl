precision highp float;

uniform sampler2D tMap;
uniform float uApplyMask;
varying vec2 vUv;

void main() {

    vec4 col = texture2D(tMap, vUv);
    gl_FragColor = vec4(col.xyz * mix(1.0, col.w, uApplyMask), 1.0);

}
