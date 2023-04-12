#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tCurrentPosition;
uniform sampler2D tCurrentCenterOfMass;
uniform sampler2D tInitRelativePosition;
uniform sampler2D tInitPosition;
uniform sampler2D tVelocity;

uniform sampler2D tRotationMatrixColA;
uniform sampler2D tRotationMatrixColB;
uniform sampler2D tRotationMatrixColC;

uniform float uAlpha;
uniform float uTextureSize;
uniform float uVertexCount;
uniform float uDeltaTime;

uniform float uGrabbedIndex;

uniform float uApplyInput;
uniform vec3 uTargetPos;
uniform vec3 uHitPoint;

uniform vec3 uBoundsMin;
uniform vec3 uBoundsMax;

#!VARYINGS
varying vec3 vPredictedPos;
varying vec3 vCurrentPos;

#!SHADER: Vertex
#require(getCoord.glsl)
void main() {
    float index = float(gl_VertexID);
    vec2 coord = getCoord(index, uTextureSize);

    vec3 pos = texture2D(tCurrentPosition, coord).xyz;
    vec3 initPos = texture2D(tInitPosition, coord).xyz;
    vCurrentPos = pos;

    vec3 vel = texture2D(tVelocity, coord).xyz;

    vel.y -= 0.0 * uDeltaTime;

    pos += vel * uDeltaTime;
    vPredictedPos = pos;

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);

}

#!SHADER: Fragment
layout(location = 0) out vec4 data1;
layout(location = 1) out vec4 data2;
void main() {

    data1 = vec4(vPredictedPos, 1.0);
    data2 = vec4(vCurrentPos, 1.0);

}
