precision highp float;

attribute vec4 position;
attribute vec2 uv;
attribute vec4 data;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

uniform vec3 cameraPosition;

uniform mat4 shadowProjectionMatrix;
uniform mat4 shadowViewMatrix;

uniform sampler2D tPosition;
uniform sampler2D tTangent;
uniform sampler2D tVelocity;
uniform vec2 uTexelSize;
uniform float uRadius;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vViewNormal;
varying vec3 vPos;
varying vec3 vMvPos;
varying vec4 vData;
varying vec4 vShadowCoord;
varying vec3 vVelocity;

void main() {

    vec3 pos = vec3(0.0);
    vec3 headPos = texture2D(tPosition, vec2(0.0, position.w)).xyz;
    vec3 segmentPos = texture2D(tPosition, position.zw).xyz;
    vec3 segmentPosPrev = texture2D(tPosition, position.zw - vec2(uTexelSize.x, 0.0)).xyz;
    vec3 segmentPosNext = texture2D(tPosition, position.zw + vec2(uTexelSize.x, 0.0)).xyz;
    vec3 tangent = texture2D(tTangent, position.zw).xyz;

    vec3 vel = texture2D(tVelocity, position.zw).xyz;
    vVelocity = vel;

    vec3 localPlanePos = position.z > uTexelSize.x ? segmentPos + segmentPosPrev : segmentPosPrev + segmentPos;
    vec3 norm = normalize(localPlanePos - (dot(localPlanePos, tangent) * tangent));
    vec3 biNormal = normalize(cross(tangent, norm));

    vec3 normal = (biNormal * cos(position.x)) + (norm * sin(position.x));

    float phase =  uv.x * 4.0 * (1.0 - uv.x) * mix(0.3, 1.0, data.x);
    float radius = uRadius * phase;
    pos = segmentPos + (normal * radius);

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    vec4 mvPos = viewMatrix * mPos;

    vNormal = normal;
    vWorldNormal = vec3(modelMatrix * vec4(normalize(segmentPos + normal), 1.0));
    vViewNormal = normalMatrix * normal;
    vMvPos = mvPos.xyz;
    vPos = pos;
    vUv = uv;
    vData = data;

    vec4 shadowPos = shadowProjectionMatrix * shadowViewMatrix * mPos;
    vShadowCoord = shadowPos;

    gl_Position = projectionMatrix * mvPos;

}
