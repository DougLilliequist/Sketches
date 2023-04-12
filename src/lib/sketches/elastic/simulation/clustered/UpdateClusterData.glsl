#!ATTRIBUTES
attribute vec4 data;

#!UNIFORMS
uniform sampler2D tMap;
uniform float uTextureSize;

#!VARYINGS
//varying vec2 vData;
varying vec3 vData;

#!SHADER: Vertex
#require(getCoord.glsl)
void main() {
    gl_Position = vec4(data.xy * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    vec2 coord = getCoord(data.z, uTextureSize);

    vec3 pos = texture2D(tMap, coord).xyz;

    vData = pos;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vData, 1.0);
}
