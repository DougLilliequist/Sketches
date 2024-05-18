#version es 300
precision highp float;

in vec3 position;

uniform sampler2D tAQQA;
uniform sampler2D tAQQB;
uniform sampler2D tAQQC;

uniform sampler2D tAPQA;
uniform sampler2D tAPQB;
uniform sampler2D tAPQC;

uniform sampler2D tPrevRotation;
uniform float uInitMatrix;

out vec4 vRotation;
out vec3 vAqpAqqMatrixA;
out vec3 vAqpAqqMatrixB;
out vec3 vAqpAqqMatrixC;

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

vec4 mat3ToQuat(mat3 m) {
    float tr = m[0][0] + m[1][1] + m[2][2];
    float h;
    vec4 q;

    if (tr >= 0.0) {
        h = sqrt(tr + 1.0);
        q.w = 0.5 * h;
        h = 0.5 / h;

        q.x = (m[2][1] - m[1][2]) * h;
        q.y = (m[0][2] - m[2][0]) * h;
        q.z = (m[1][0] - m[0][1]) * h;
    } else {
        int i = 0;
        if (m[1][1] > m[0][0]) i = 1;
        if (m[2][2] > m[i][i]) i = 2;

        if (i == 0) {
            h = sqrt((m[0][0] - (m[1][1] + m[2][2])) + 1.0);
            q.x = 0.5 * h;
            h = 0.5 / h;

            q.y = (m[0][1] + m[1][0]) * h;
            q.z = (m[2][0] + m[0][2]) * h;
            q.w = (m[2][1] - m[1][2]) * h;
        } else if (i == 1) {
            h = sqrt((m[1][1] - (m[2][2] + m[0][0])) + 1.0);
            q.y = 0.5 * h;
            h = 0.5 / h;

            q.z = (m[1][2] + m[2][1]) * h;
            q.x = (m[0][1] + m[1][0]) * h;
            q.w = (m[0][2] - m[2][0]) * h;
        } else {
            h = sqrt((m[2][2] - (m[0][0] + m[1][1])) + 1.0);
            q.z = 0.5 * h;
            h = 0.5 / h;

            q.x = (m[2][0] + m[0][2]) * h;
            q.y = (m[1][2] + m[2][1]) * h;
            q.w = (m[1][0] - m[0][1]) * h;
        }
    }

    return q;
}

vec4 quaternionFromAngleAxis(in float angle, in vec3 axis) {
    float half_angle = angle * 0.5;
    float s = sin(half_angle);

    vec4 q;
    q.x = axis.x * s;
    q.y = axis.y * s;
    q.z = axis.z * s;
    q.w = cos(half_angle);

    return q;
}

vec4 multiplyQuaternions(in vec4 q1, in vec4 q2) {
    vec4 result;
    result.xyz = q2.xyz * q1.w + q1.xyz * q2.w + cross(q1.xyz, q2.xyz);
    result.w = q1.w * q2.w - dot(q1.xyz, q2.xyz);
    return (result);
}

#define EPS 1.0e-9

void main() {

    gl_Position = vec4(vec2(0.5), 0.0, 1.0);
    gl_PointSize = 1.0;

    mat3 AqqMatrix = mat3(0.0);
    AqqMatrix[0] = texelFetch(tAQQA, ivec2(0.0), 0).xyz;
    AqqMatrix[1] = texelFetch(tAQQB, ivec2(0.0), 0).xyz;
    AqqMatrix[2] = texelFetch(tAQQC, ivec2(0.0), 0).xyz;

    mat3 ApqMatrix = mat3(0.0);
    ApqMatrix[0] = texelFetch(tAPQA, ivec2(0.0), 0).xyz;
    ApqMatrix[1] = texelFetch(tAPQB, ivec2(0.0), 0).xyz;
    ApqMatrix[2] = texelFetch(tAPQC, ivec2(0.0), 0).xyz;

    mat3 aqqInv = inverse(AqqMatrix);

    //based on following paper: https://matthias-research.github.io/pages/publications/stablePolarDecomp.pdf
    //credits to Mathias Müller Et. Al

    mat3 A = ApqMatrix; //for convinicence and following along the papers method
    vec4 q = mix(texelFetch(tPrevRotation, ivec2(0.0), 0), normalize(mat3ToQuat(aqqInv)), uInitMatrix);

    for (int i = 0; i < 20; i++) {
        mat3 R = quatToMat3(q);
        vec3 numerator = cross(A[0], R[0]) + cross(A[1], R[1]) + cross(A[2], R[2]);
        float denom = (1.0 / abs(dot(A[0], R[0]) + dot(A[1], R[1]) + dot(A[2], R[2])) + EPS);
        vec3 omega = numerator * denom;
        float w = length(omega);
        if(w < EPS) break;

        vec4 rotationQuaternion = quaternionFromAngleAxis(w, omega / w);
        q = multiplyQuaternions(q, rotationQuaternion);
        q = normalize(q);
    }

    vRotation = q;

    mat3 ApqAqqMatrix = ApqMatrix * aqqInv; //used for linear deformations..
    vAcolA = ApqAqqMatrix[0];
    vAcolB = ApqAqqMatrix[1];
    vAcolC = ApqAqqMatrix[2];

}
