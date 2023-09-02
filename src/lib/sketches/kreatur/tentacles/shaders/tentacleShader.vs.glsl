precision highp float;

attribute vec4 position;
attribute vec2 uv;

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
varying vec3 vEyeDir;

void main() {

    vec3 pos = vec3(0.0);
    vec3 headPos = texture2D(tPosition, vec2(0.0, position.w)).xyz;
    vec3 segmentPos = texture2D(tPosition, position.zw).xyz;
    vec3 segmentPosPrev = texture2D(tPosition, position.zw - vec2(uTexelSize.x, 0.0)).xyz;
    vec3 segmentPosNext = texture2D(tPosition, position.zw + vec2(uTexelSize.x, 0.0)).xyz;
    vec3 tangent = texture2D(tTangent, position.zw).xyz;

    //vec3 dirToRoot = position.z > uTexelSize.x ? headPos - segmentPos : normalize(segmentPos);
//    vec3 localPlanePos = position.z > uTexelSize.x ? segmentPos + segmentPosPrev : segmentPosPrev + segmentPos;
//    vec3 tmpNorm = normalize(localPlanePos - (dot(localPlanePos, tangent) * tangent));
//    vec3 biNormal = normalize(cross(tangent, tmpNorm));
//    vec3 norm = normalize(cross(biNormal, tangent));

    vec3 localPlanePos = position.z > uTexelSize.x ? segmentPos + segmentPosPrev : segmentPosPrev + segmentPos;
    vec3 norm = normalize(localPlanePos - (dot(localPlanePos, tangent) * tangent));
    vec3 biNormal = normalize(cross(tangent, norm));
//    vec3 norm = normalize(cross(biNormal, tangent));

    vec3 normal = (biNormal * cos(position.x)) + (norm * sin(position.x));

    float phase =  uv.x * 4.0 * (1.0 - uv.x);
    float radius = uRadius * phase;
//    float radius = pow(uRadius, exp(-1.0 * x)) * (1.0 * uv.x0.1));
//    float func = (exp(-10.5 * (uv.x + 0.1)) * pow(10.0 * uv.x, 4.0));
    pos = segmentPos + (normal * radius);

    vNormal = normalize(normal);
    vEyeDir = cameraPosition - pos;
    vPos = pos;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}
