precision highp float;

attribute vec3 position;
attribute vec3 worldPosition;
attribute vec2 uv;
attribute vec3 params;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform sampler2D _Position;
uniform sampler2D _Velocity;

uniform mat4 shadowProjectionMatrix;
uniform mat4 shadowViewMatrix;
uniform sampler2D tShadow;

uniform float _ShadowMapTexelSize;
uniform float _ShadowWeight;
uniform float _Bias;

varying vec2 vUv;
varying float vLife;
varying float vShadow;

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

float softShadow(in vec3 shadowCoord) {

    //if particle is outside the shadowmap, then it's for sure not being occluded
    if(shadowCoord.x < 0.0 || shadowCoord.x > 1.0) return 1.0;
    if(shadowCoord.y < 0.0 || shadowCoord.y > 1.0) return 1.0;
    if(shadowCoord.z < 0.0 || shadowCoord.z > 1.0) return 1.0;

    float shadow = 9.0;
    for(float y = -1.5; y <= 1.5; y++) {
        for(float x = -1.5; x <= 1.5; x++) {

            vec2 hash = hash22((10000.0 * shadowCoord.xy) + vec2(x, y)) * 2.0 - 1.0;
            // vec2 hash = hash22((1000.0 * shadowCoord.xy) + vec2(float(x), float(y))) - 0.5;
            vec2 offset = (vec2(x, y) + hash) * _ShadowMapTexelSize;

            float sampledShadow = unpackRGBA(texture2D(tShadow, shadowCoord.xy + offset));
            if(shadowCoord.z - _Bias > sampledShadow) {
                shadow -= 1.0;
            }

        }
    }

    return shadow * _ShadowWeight;

}

void main() {


    vec4 worldPos = texture2D(_Position, worldPosition.xy);

    float scalePhase = (worldPos.w * 4.0 * (1.0 - worldPos.w)) ;

    vec4 modelViewPos = modelViewMatrix * vec4(worldPos.xyz, 1.0);
    modelViewPos.xy += position.xy * SCALE * scalePhase * mix(0.75, 1.0, params.x);

    gl_Position = projectionMatrix * modelViewPos;

    vec4 shadowModelViewPos = shadowViewMatrix * modelMatrix * vec4(worldPos.xyz, 1.0);
    vec4 shadowCoord = shadowProjectionMatrix * shadowModelViewPos;
    vShadow = softShadow((shadowCoord.xyz / shadowCoord.w)*0.5+0.5);

    vUv = uv;
    vLife = worldPos.w;

}

