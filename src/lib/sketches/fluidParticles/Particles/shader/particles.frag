precision highp float;

uniform sampler2D _Normal;
uniform vec3 _Light;

varying vec2 vUv;
varying vec3 vNormal;
varying float vLife;
varying float vShadow;

void main() {

    vec3 normal = texture2D(_Normal, vUv).xyz;
    vec2 c = 2.0 * vUv - 1.0;
    if(dot(c,c) > 0.8) discard;
    normal = normal * 2.0 - 1.0;

    float light = dot(normal, _Light) * 0.5 + 0.5;

    vec3 col = vec3(0.61, 0.8, 0.98);
    col = mix(mix(col + vec3(0.3, 0.0, 0.0), col + vec3(0.0, 0.0, 0.8), vLife), col, vLife); //subtle doppler effect
    col *= light * 2.0;
    col *= mix(0.6, 1.0, vShadow);

    gl_FragColor = vec4(col, 1.0);

}
