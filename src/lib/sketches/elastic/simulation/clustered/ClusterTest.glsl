#!ATTRIBUTES
attribute vec4 data;

#!UNIFORMS
uniform sampler2D tPositions;
uniform float uTextureSize;

#!VARYINGS
//varying vec2 vData;
varying vec3 vData;

#!SHADER: Vertex
void main() {
    gl_Position = vec4(data.xy * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    float posX = mod(data.z, uTextureSize) + 0.5;
    float posY = floor(data.z / uTextureSize) + 0.5;
    vec2 coord = vec2(posX, posY)/ uTextureSize;

    vec3 pos = texture2D(tPositions, coord).xyz;

    vData = pos;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vData, 1.0);
}
