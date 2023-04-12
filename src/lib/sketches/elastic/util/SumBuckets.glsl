#!ATTRIBUTES
//x: local texture coordinate along x
//y: local texture coordinate along y
//z: vertex ID of bucket element
//w: bucket index;
attribute vec4 data;

#!UNIFORMS
uniform sampler2D tMap;
uniform float uTileCount;
uniform float uTextureSize;

#!VARYINGS
varying vec4 vData;

#!SHADER: Vertex
#require(getCoord.glsl)
void main() {

    vec2 coord = getCoord(data.w, uTileCount);
    gl_Position = vec4(coord * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
    vData = texture2D(tMap, data.xy);
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vData;
//    gl_FragColor.a = dot(vData, vData) > 0.0 ? 1.0 : 0.0;
    gl_FragColor.a = 1.0;
}
