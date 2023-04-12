#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tP;
uniform sampler2D tQ;
uniform float isQQ;

uniform float uTextureSize;

#!VARYINGS
varying vec3 vColA;
varying vec3 vColB;
varying vec3 vColC;

#!SHADER: Vertex
void main() {
    float index = float(gl_VertexID);
    float posX = mod(index, uTextureSize) + 0.5;
    float posY = floor(index / uTextureSize) + 0.5;
    vec2 coord = vec2(posX, posY)/ uTextureSize;

    vec3 p = texture2D(tP, coord).xyz;
    vec3 q = texture2D(tQ, coord).xyz;

    mat3 pqT = outerProduct(p, q);
    vColA = pqT[0];
    vColB = pqT[1];
    vColC = pqT[2];

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
layout(location = 0) out vec4 data1;
layout(location = 1) out vec4 data2;
layout(location = 2) out vec4 data3;
void main() {
    data1 = vec4(vColA, 1.0);
    data2 = vec4(vColB, 1.0);
    data3 = vec4(vColC, 1.0);
}
