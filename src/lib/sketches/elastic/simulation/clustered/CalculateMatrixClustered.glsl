#!ATTRIBUTES
//x: local texture coordinate along x
//y: local texture coordinate along y
//z: vertex ID
//w: bucket index;
attribute vec4 data;

#!UNIFORMS
uniform sampler2D tP;
uniform sampler2D tQ;
uniform float isQQ;

#!VARYINGS
varying vec3 vColA;
varying vec3 vColB;
varying vec3 vColC;

#!SHADER: Vertex
#require(getCoord.glsl)
void main() {

    vec3 p = texture2D(tP, data.xy).xyz;
    vec3 q = texture2D(tQ, data.xy).xyz;

    mat3 pqT = outerProduct(p, q);
    vColA = pqT[0];
    vColB = pqT[1];
    vColC = pqT[2];

    gl_Position = vec4(data.xy * 2.0 - 1.0, 0.0, 1.0);
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
