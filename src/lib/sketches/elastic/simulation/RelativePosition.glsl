#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tPosition;
uniform sampler2D tCenterOfMass;

uniform float uTextureSize;
uniform float uVertexCount;

#!VARYINGS
varying vec3 vPos;

#!SHADER: Vertex
void main() {
    float index = float(gl_VertexID);
    float posX = mod(index, uTextureSize) + 0.5;
    float posY = floor(index / uTextureSize) + 0.5;
    vec2 coord = vec2(posX, posY)/ uTextureSize;

    vec3 pos = texture2D(tPosition, coord).xyz;
    vec3 centerOfMass = texture2D(tCenterOfMass, vec2(0.5)).xyz / uVertexCount;

    vPos = pos - centerOfMass;

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vPos, 1.0);
}
