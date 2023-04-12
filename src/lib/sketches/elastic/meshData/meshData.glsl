#!ATTRIBUTES

#!UNIFORMS
uniform float uVertexCount;
uniform float uTextureSize;

#!VARYINGS
varying vec3 vPosition;
varying vec3 vNormal;

#!SHADER: Vertex
void main() {

    float index = float(gl_VertexID);
    float posX = mod(index, uTextureSize) + 0.5;
    float posY = floor(index / uTextureSize) + 0.5;
    vec2 coord = vec2(posX, posY)/ uTextureSize;

    vPosition = position;
    vNormal = normal;

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
layout(location = 0) out vec4 data1;
layout(location = 1) out vec4 data2;
void main() {
    data1 = vec4(vPosition, 1.0);
    data2 = vec4(vNormal, 1.0);
}
