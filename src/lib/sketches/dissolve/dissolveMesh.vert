attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

attribute vec3 center;
attribute vec3 faceNormal;
attribute float triangleIndex;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float uTime;

varying vec3 vFaceNormal;
varying vec3 vNormal;

#define PI 3.14159265359

mat2 rotate2D(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

vec4 quatFromAxisAngle(vec3 axis, float angle) {
    float halfAngle = angle * 0.5;
    float s = sin(halfAngle);
    return vec4(axis * s, cos(halfAngle));
}

vec3 rotateVectorByQuaternion(vec3 v, vec4 q) {
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

float hash11(float p)
{
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

vec3 hash33(vec3 p3)
{
    p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);

}

void main() {

    vec3 pos = position;
    vec3 c = center;

    vec3 r3 = hash33(pos * 1000.0);
    pos += ((r3 - 0.5) * 2.0) * 0.001;

    float animDir = dot(normalize(vec3(0.0, 1.0, 1.0)), faceNormal)*0.5+0.5;

    vec3 triPos = pos - c;
    float phase = fract(fract(uTime * 0.1) + (animDir));
    phase = phase * phase;

    float rand = hash11(triangleIndex * 1000.0);

    float osciliationPhase = animDir;
    //osciliationPhase += (rand-0.5)*2.0; //interesting...
    osciliationPhase += (rand-0.5)*0.1;
    float oscilation = (sin(uTime + osciliationPhase * PI) * 0.5 + 0.5);
//    float oscilation = (sin(uTime + (triangleIndex) * PI) * 0.5 + 0.5);

    vec3 axis = normalize(cross(faceNormal, vec3(0.0, 1.0, 0.0)));
    if(abs(dot(faceNormal, vec3(0.0, 1.0, 0.0))) > 1.0 - 0.0005) {
        axis = normalize(cross(faceNormal, vec3(0.0, 0.0, 1.0)));
    }

    vec4 quat = quatFromAxisAngle(axis, uTime);
    //triPos = rotateVectorByQuaternion(triPos, quat);
    float scalePhase = fract(uTime * .1);
    //triPos *= oscilation;

    vec3 fNorm = normalize(center);
    vec3 dir = fNorm;
//    c.xz = rotate2D(uTime + animDir * PI * 3.0) * c.xz;
//    c += dir * oscilation * 1.2;
    vec3 finalPos = triPos + c;
    finalPos += dir * oscilation * 1.2;
    finalPos.xz = rotate2D(uTime + animDir * PI * 1.0) * finalPos.xz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
//    vFaceNormal = faceNormal;
    vNormal = normal;
}
