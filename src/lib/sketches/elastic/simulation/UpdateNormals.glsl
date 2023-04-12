#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tNormal;

uniform sampler2D tRotationMatrixColA;
uniform sampler2D tRotationMatrixColB;
uniform sampler2D tRotationMatrixColC;

uniform float uTextureSize;

#!VARYINGS
varying vec3 vNormal;

#!SHADER: Vertex
void main() {
    float index = float(gl_VertexID);
    float posX = mod(index, uTextureSize) + 0.5;
    float posY = floor(index / uTextureSize) + 0.5;
    vec2 coord = vec2(posX, posY)/ uTextureSize;

    mat3 R = mat3(0.0);
    R[0] = texture2D(tRotationMatrixColA, coord).xyz;
    R[1] = texture2D(tRotationMatrixColB, coord).xyz;
    R[2] = texture2D(tRotationMatrixColC, coord).xyz;

    vec3 normal = texture2D(tNormal, coord).xyz;

    normal = R * normal;
    vNormal = normalize(normal);

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vNormal, 1.0);
}
