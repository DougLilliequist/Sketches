#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tInitNormals;

uniform sampler2D tQuaternion;
uniform sampler2D tAPQAQQInvA;
uniform sampler2D tAPQAQQInvB;
uniform sampler2D tAPQAQQInvC;

uniform float uSize;
uniform float uBeta;

out vec3 vNormal;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

mat3 quatToMat3(in vec4 q) {
    float x2 = q.x + q.x;
    float y2 = q.y + q.y;
    float z2 = q.z + q.z;

    float xx = q.x * x2;
    float xy = q.x * y2;
    float xz = q.x * z2;

    float yy = q.y * y2;
    float yz = q.y * z2;
    float zz = q.z * z2;

    float wx = q.w * x2;
    float wy = q.w * y2;
    float wz = q.w * z2;

    mat3 result;
    result[0] = vec3(1.0 - (yy + zz), xy - wz, xz + wy);
    result[1] = vec3(xy + wz, 1.0 - (xx + zz), yz - wx);
    result[2] = vec3(xz - wy, yz + wx, 1.0 - (xx + yy));

    return result;
}

void main() {
    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    ivec2 iCoord = ivec2(coord * uSize);

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    mat3 R = quatToMat3(texelFetch(tQuaternion, ivec2(0, 0), 0));

    vec3 AA = texelFetch(tAPQAQQInvA, ivec2(0, 0), 0).xyz;
    vec3 AB = texelFetch(tAPQAQQInvB, ivec2(0, 0), 0).xyz;
    vec3 AC = texelFetch(tAPQAQQInvC, ivec2(0, 0), 0).xyz;

    mat3 A = mat3(AA, AB, AC);
    R = (uBeta * A) + ((1.0 - uBeta) * R);

    vec3 normal = texelFetch(tInitNormals, iCoord, 0).xyz;
    vNormal = R * normal;

}
