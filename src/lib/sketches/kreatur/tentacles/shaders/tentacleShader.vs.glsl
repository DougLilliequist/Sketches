#version 300 es
precision highp float;

in vec4 position;
in vec2 uv;
in vec4 data;

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

out vec2 vUv;
out vec3 vNormal;
out vec3 vWorldNormal;
out vec3 vViewNormal;
out vec3 vPos;
out vec3 vMvPos;
out vec4 vData;
out vec4 vShadowCoord;
out vec3 vVelocity;
out vec3 vUnNormalNormal;

vec3 perturbNormals(vec3 roundedNormals, vec3 flatNormals, float chamferFactor) {
    // Calculate the angle between the rounded normals and the flat normals
    float angle = dot(roundedNormals, flatNormals);

    // Use the chamferFactor to control the perturbation of the normals
    vec3 perturbedNormals = mix(roundedNormals, flatNormals, smoothstep(0.0, 1.0, angle) * chamferFactor);

    return normalize(perturbedNormals);
}

#define PI 3.14159265359

void main() {

    vec3 pos = vec3(0.0);
    vec3 headPos = texture(tPosition, vec2(0.0, position.w)).xyz;
    vec3 segmentPos = texture(tPosition, position.zw).xyz;
    vec3 segmentPosPrev = texture(tPosition, position.zw - vec2(uTexelSize.x, 0.0)).xyz;
    vec3 segmentPosNext = texture(tPosition, position.zw + vec2(uTexelSize.x, 0.0)).xyz;
    vec3 tangent = texture(tTangent, position.zw).xyz;

    vec3 vel = texture(tVelocity, position.zw).xyz;
    vVelocity = vel;

    vec3 localPlanePos = position.z > uTexelSize.x ? segmentPos + segmentPosPrev : segmentPosPrev + segmentPos;
    vec3 norm = normalize(localPlanePos - (dot(localPlanePos, tangent) * tangent));
    vec3 biNormal = normalize(cross(tangent, norm));

    vec3 normal = (biNormal * cos(position.x)) + (norm * sin(position.x));
    vec3 box = (biNormal * sign(cos(position.x))) + (norm * sign(sin(position.x)));

    vec3 finalNormal = mix(box, normal, 0.2);

    //vec3 perturbNorm = perturbNormals(normal, box, 0.9);
//    vec3 finalNormal = mix(fin);


    //TODO: MAKE SURE THE PHASE IS THE SAME ONE USED IN THE SHADOW SHADER
    float phase =  uv.x * 4.0 * (1.0 - uv.x);
    //float radius = uRadius * mix(0.5, 1.0, data.x);
    float radius = uRadius;
    pos = segmentPos + (normal * radius * phase);
//    pos = segmentPos + (finalNormal * radius);

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    vec4 mvPos = viewMatrix * mPos;

    vNormal = normal;
    vUnNormalNormal = normal * radius;
    vViewNormal = normalMatrix * normal;
    vMvPos = mvPos.xyz;
    vPos = pos;
    vUv = uv;
    vData = data;

    vec4 shadowPos = shadowProjectionMatrix * shadowViewMatrix * mPos;
    vShadowCoord = shadowPos;

    gl_Position = projectionMatrix * mvPos;

}
