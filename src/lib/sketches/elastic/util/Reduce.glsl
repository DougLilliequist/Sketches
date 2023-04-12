#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;
uniform float uSize;

#!VARYINGS
varying vec2 vUv;

#!SHADER: Vertex
void main() {
    gl_Position = vec4(position, 1.0);
    vUv = uv;
}

    #!SHADER: Fragment
void main() {

    vec2 coord = floor(vUv * uSize) / uSize;
    float stp = (1.0 / uSize) * 0.5;

    vec3 a = texture2D(tMap, coord + vec2(0.0)).xyz;
    vec3 b = texture2D(tMap, coord + vec2(stp, 0.0)).xyz;
    vec3 c = texture2D(tMap, coord + vec2(0.0, stp)).xyz;
    vec3 d = texture2D(tMap, coord + vec2(stp)).xyz;

    gl_FragColor.rgb = a + b + c + d;
    gl_FragColor.a = 1.0;
}
