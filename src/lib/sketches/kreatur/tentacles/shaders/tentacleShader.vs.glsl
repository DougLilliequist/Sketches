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
    vec3 segmentPos = texture2D(tPosition, position.zw).xyz;
    vec3 segmentPosPrev = texture2D(tPosition, position.zw - vec2(uTexelSize.x, 0.0)).xyz;
    vec3 segmentPosNext = texture2D(tPosition, position.zw + vec2(uTexelSize.x, 0.0)).xyz;
    vec3 tangent = texture2D(tTangent, position.zw).xyz;
//    vec3 tangent = vec3(0.0);

//    vec3 fakeNormal = normalize(segmentPosPrev - segmentPos);
    vec3 fakeNormal = vec3(0.0);
    if(position.z < 1.0 - uTexelSize.x) {
        fakeNormal = normalize(segmentPos + segmentPosNext);
    } else {
        fakeNormal = normalize(segmentPosPrev + segmentPos);
    }


    vec3 biNormal = normalize(cross(tangent, fakeNormal));
    vec3 norm = normalize(cross(biNormal, tangent));

    vec3 normal = (biNormal * cos(position.x)) + (norm * sin(position.x));

    float phase =  position.y / 128.0;
    float radius = uRadius;
    pos = segmentPos + (normal * radius);

    vNormal = normalMatrix * normalize(normal);
    vEyeDir = cameraPosition - pos;
    vPos = pos;
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}
