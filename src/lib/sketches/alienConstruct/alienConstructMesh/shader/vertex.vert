precision highp float;

attribute vec3 position;
attribute vec3 worldPosition;
attribute vec3 normalAxis;
attribute vec3 biNormalAxis;
attribute vec3 tangentAxis;
attribute vec3 normal;
attribute vec3 params;

uniform float _Time;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vNormal;

#define TAU 3.14159265359 * 2.0

mat2 rotate2D(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {

    //non-rotated position, scale, rotate w/e without any headaches
    vec3 localPos = position;
    localPos *= vec3(0.35, 1.0, 0.02);

    float scalePhase = fract((_Time*.1) + params.y);
    scalePhase = 1.0-scalePhase;
    scalePhase = 1.0 - (scalePhase * scalePhase);
    scalePhase = scalePhase * 4.0 * (1.0-scalePhase);

    localPos *= scalePhase;
    localPos.xy = rotate2D(_Time + (params.x * TAU*0.5 * scalePhase)) * localPos.xy;
    localPos.yz = rotate2D(TAU * 0.1 * scalePhase) * localPos.yz;

    //        localPos.xy = rotate2D(_Time + params.x * TAU) * localPos.xy;
    //    localPos *= vec3(0.35, 1.0, 0.1);

//    localPos.xz = rotate2D(_Time + params.x) * localPos.xz;

    vec3 norm = normal;
    norm.xy = rotate2D(_Time + (params.x * TAU*0.5 * scalePhase)) * norm.xy;
    norm.yz = rotate2D(TAU * 0.1 * scalePhase) * norm.yz;
//    mat3 ringPosMatrix = mat3(
//        biNormalAxis,
//        normalAxis,
//        tangentAxis
//    );

    vec3 normAxis = normalAxis;

    vec3 ringLocalPos = (biNormalAxis * localPos.x) + (normalAxis * localPos.y) + (tangentAxis * localPos.z);
    vec3 ringNormal = (biNormalAxis * norm.x) + (normalAxis * norm.y) + (tangentAxis * norm.z); //rotate normals as well;

    vec3 worldPos = worldPosition * .7 * scalePhase;
//    worldPos += (normAxis * cos(_Time + (params.x * TAU)) * 0.5 + 0.5) * 0.2;
//    worldPos.z += sin(_Time + params.x * TAU) * .1;
    vec3 finalPos = worldPos + ringLocalPos;

    vNormal = normalize(ringNormal + worldPos);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);

}
