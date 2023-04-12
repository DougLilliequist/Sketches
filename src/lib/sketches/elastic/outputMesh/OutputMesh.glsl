#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tPosition;
uniform sampler2D tNormal;

uniform float uTextureSize;

uniform vec3 uBoundsMin;
uniform vec3 uBoundsMax;
uniform vec3 uInputPos;
uniform vec3 uHitPoint;
uniform float uApplyInput;


#!VARYINGS
varying vec3 vNormal;
varying vec3 vPos;

#!SHADER: Vertex
#require(range.glsl)
void main() {

    float index = float(gl_VertexID);
    float posX = mod(index, uTextureSize) + 0.5;
    float posY = floor(index / uTextureSize) + 0.5;
    vec2 coord = vec2(posX, posY)/ uTextureSize;

    vec3 localPos = texture2D(tPosition, coord).xyz;
    vec3 norm = texture2D(tNormal, coord).xyz;

    vPos = localPos;
    vNormal = norm;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(localPos, 1.0);
}

    #!SHADER: Fragment
void main() {

    float light = dot(normalize(vNormal * 0.5 + vec3(0.0, 1.0, 0.0) - vPos), vNormal) * 0.25 + (1.0 - 0.25);
    gl_FragColor = vec4(vec3(light), 1.0);
}
