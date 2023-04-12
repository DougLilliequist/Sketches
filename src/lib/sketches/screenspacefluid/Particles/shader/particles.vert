#version 300 es
precision highp float;

in vec3 position;
in vec3 params;

uniform vec3 cameraPosition;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform sampler2D _Position;
uniform sampler2D _PrevPos;
uniform sampler2D _Velocity;

uniform float _ShadowMapTexelSize;
uniform float _ShadowWeight;
uniform float _Bias;

out float vLife;
out float vShadow;
out vec3 vViewPos;
out vec3 vEyeDir;
out float vSize;
out vec3 vVelocity;

//#define SCALE 0.025
#define SCALE 0.035

float unpackRGBA (vec4 v) {
    return dot(v, 1.0 / vec4(1.0, 255.0, 65025.0, 16581375.0));
}

vec2 hash22(in vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

void main() {


    vec4 worldPos = texture(_Position, position.xy);
    vec4 prevPos = texture(_PrevPos, position.xy);
    vec4 velocity = texture(_Velocity, position.xy);
    float scalePhase = (worldPos.w * 4.0 * (1.0 - worldPos.w)) ;
    vec4 modelViewPos = modelViewMatrix * vec4(worldPos.xyz, 1.0);
    gl_Position = projectionMatrix * modelViewPos;
    vSize = scalePhase * 0.1 * (1000.0 / length(modelViewPos.xyz));
    gl_PointSize = vSize;

    vLife = worldPos.w;
    vViewPos = modelViewPos.xyz;
//    vVelocity = (worldPos.xyz - prevPos.xyz);
    vVelocity = velocity.xyz;

}

