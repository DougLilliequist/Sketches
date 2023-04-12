#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tPosition;
uniform sampler2D tInitPositions;
uniform float uTextureSize;

#!VARYINGS
varying vec3 vCorrectedPos;

#!SHADER: Vertex
#require(getCoord.glsl)

void main() {
    float index = float(gl_VertexID);
    vec2 coord = getCoord(index, uTextureSize);

    float compliance = 1.0 / (1.0 + 0.9);
    vec3 correction = vec3(0.0);
    vec3 pos = texture2D(tPosition, coord).xyz;

    //    vec3 centerOfMass = texture2D(tCurrentCenterOfMass, vec2(0.5)).xyz / uVertexCount;
    //    vec3 initPositions = texture2D(tInitRelativePosition, coord).xyz;
    vec4 initPositions = texture2D(tInitPositions, coord);
    float restLength = initPositions.w;
    vec3 dir = initPositions.xyz - pos;
    float len = length(pos);
//    dir /= len;
    if(len > restLength) correction += dir * (len - restLength);
    pos += correction;

    vCorrectedPos = pos;

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vCorrectedPos, 1.0);
}
