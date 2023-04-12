#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;

#!VARYINGS
varying vec2 vUv;

#!SHADER: Vertex
void main() {
    gl_Position = vec4(position, 1.0);
    vUv = uv;
}

    #!SHADER: Fragment
void main() {

    vec3 pos = texture2D(tMap, vUv).xyz;
    float restLength = length(pos);
    gl_FragColor = vec4(pos, restLength);
}
