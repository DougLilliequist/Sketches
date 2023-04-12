#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tPositionData;
uniform float uTextureSize;

uniform vec3 uHitData;
uniform vec3 uRayOrigin;
uniform vec3 uRayDirection;

#!VARYINGS
varying vec3 vData;

#!SHADER: Vertex
#require(getCoord.glsl)
void main() {

    float index = float(gl_VertexID);
    vec2 coord = getCoord(index, uTextureSize);
    vec3 pos = texture2D(tPositionData, coord).xyz;

    vec3 interactionPos = uRayOrigin + uRayDirection * uHitData.y;

    float dist = length(interactionPos - pos);
    vData = vec3(dist, 0.0, 0.0);

    gl_Position = vec4(coord * 2.0 - 1.0, 0.0, 1.0);
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vData, 1.0);
}
