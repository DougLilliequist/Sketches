precision highp float;

attribute vec4 position;
attribute vec2 uv;
attribute vec4 data;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

uniform vec3 cameraPosition;

uniform sampler2D tPosition;
uniform sampler2D tTangent;
uniform vec2 uTexelSize;
uniform float uRadius;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;
varying vec3 vMvPos;
varying vec4 vData;

void main() {

    vec3 pos = vec3(0.0);
    vec3 headPos = texture2D(tPosition, vec2(0.0, position.w)).xyz;
    vec3 segmentPos = texture2D(tPosition, position.zw).xyz;
    vec3 segmentPosPrev = texture2D(tPosition, position.zw - vec2(uTexelSize.x, 0.0)).xyz;
    vec3 segmentPosNext = texture2D(tPosition, position.zw + vec2(uTexelSize.x, 0.0)).xyz;
    vec3 tangent = texture2D(tTangent, position.zw).xyz;

    vec3 localPlanePos = position.z > uTexelSize.x ? segmentPos + segmentPosPrev : segmentPosPrev + segmentPos;
    vec3 norm = normalize(localPlanePos - (dot(localPlanePos, tangent) * tangent));
    vec3 biNormal = normalize(cross(tangent, norm));

    vec3 normal = (biNormal * cos(position.x)) + (norm * sin(position.x));

    float phase =  uv.x * 4.0 * (1.0 - uv.x) * mix(0.15, 1.0, data.x);
    float radius = uRadius * phase;
    pos = segmentPos + (normal * radius);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

}
