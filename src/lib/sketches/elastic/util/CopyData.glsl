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
    gl_FragColor = texture2D(tMap, vUv);
}
