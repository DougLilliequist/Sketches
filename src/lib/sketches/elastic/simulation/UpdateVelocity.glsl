#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tSolvedPosition;
uniform sampler2D tPrevPosition;

uniform float uTextureSize;
uniform float uDeltaTime;

#!VARYINGS
varying vec3 vVelocity;

#!SHADER: Vertex
#require(getCoord.glsl)
void main() {
    float index = float(gl_VertexID);
    vec2 coord = getCoord(index, uTextureSize);

    vec3 currentPos = texture2D(tSolvedPosition, coord).xyz;
    vec3 prevPos = texture2D(tPrevPosition, coord).xyz;

    vVelocity = (currentPos - prevPos) / uDeltaTime;
//    vVelocity *= 0.982;
//    vVelocity *= 0.9997;
//    vVelocity *= 0.965;
//    vVelocity *= 0.985;
    vVelocity *= 0.985;
//    vVelocity *= 0.997;
    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vVelocity, 1.0);
}
