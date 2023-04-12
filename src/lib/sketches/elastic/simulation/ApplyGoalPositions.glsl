#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tSolvedPosition;
uniform sampler2D tInitRelativePosition;
uniform sampler2D tCurrentCenterOfMass;

uniform sampler2D tRotationMatrixColA;
uniform sampler2D tRotationMatrixColB;
uniform sampler2D tRotationMatrixColC;

uniform float uAlpha;

uniform float uTextureSize;
uniform float uVertexCount;

#!VARYINGS
varying vec3 vPos;

#!SHADER: Vertex
#require(getCoord.glsl)
void main() {
    float index = float(gl_VertexID);
    vec2 coord = getCoord(index, uTextureSize);

    vec3 pos = texture2D(tSolvedPosition, coord).xyz;

    mat3 rotationMatrix = mat3(0.0);
    rotationMatrix[0] = texture2D(tRotationMatrixColA, vec2(0.5)).xyz;
    rotationMatrix[1] = texture2D(tRotationMatrixColB, vec2(0.5)).xyz;
    rotationMatrix[2] = texture2D(tRotationMatrixColC, vec2(0.5)).xyz;

    vec3 centerOfMass = texture2D(tCurrentCenterOfMass, vec2(0.5)).xyz / uVertexCount;
    vec3 initRelativePosition = texture2D(tInitRelativePosition, coord).xyz;
    vec3 goalPosition = (rotationMatrix * initRelativePosition) + centerOfMass;
    pos += uAlpha * (goalPosition - pos);

    vPos = pos;

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vPos, 1.0);
}
