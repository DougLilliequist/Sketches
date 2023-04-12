#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;
uniform float uTextureSize;

#!VARYINGS
varying vec4 vData;

#!SHADER: Vertex
#require(getCoord.glsl);
void main() {
    gl_Position = vec4(vec2(0.5), 0.0, 1.0);
    vec2 coord = getCoord(float(gl_VertedID), uTextureSize);
    vData = texture2D(tMap, coord);
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vData;
}
