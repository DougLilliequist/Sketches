#!ATTRIBUTES
//x: local texture coordinate along x
//y: local texture coordinate along y
//z: vertex ID
//w: bucket index;
attribute vec4 data;

#!UNIFORMS
uniform sampler2D tAPQColA;
uniform sampler2D tAPQColB;
uniform sampler2D tAPQColC;

uniform sampler2D tAQQColA;
uniform sampler2D tAQQColB;
uniform sampler2D tAQQColC;

uniform float uBeta;
uniform float uTileCount;

#!VARYINGS
varying vec3 vMatrixColA;
varying vec3 vMatrixColB;
varying vec3 vMatrixColC;

#!SHADER: Vertex
#require(getCoord.glsl)
void main() {

    vec2 bucketCoord = getCoord(float(gl_VertexID), uTileCount);

    mat3 Apq = mat3(0.0);
    Apq[0] = texture2D(tAPQColA, bucketCoord).xyz;
    Apq[1] = texture2D(tAPQColB, bucketCoord).xyz;
    Apq[2] = texture2D(tAPQColC, bucketCoord).xyz;

    mat3 Aqq = mat3(0.0);
    Aqq[0] = texture2D(tAQQColA, bucketCoord).xyz;
    Aqq[1] = texture2D(tAQQColB, bucketCoord).xyz;
    Aqq[2] = texture2D(tAQQColC, bucketCoord).xyz;

    Aqq = inverse(Aqq);
    mat3 A = Apq * Aqq; //note the inverse of AQQ can be pre-computed

    mat3 ATpq = transpose(Apq);
    mat3 S = ATpq * Apq;
    mat3 Z = mat3(
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    );

    float _k = 0.57;
//    //denman-beavers iterative solver for square root matrices
    for(int i = 0; i < 60; i++) {
        S = _k * (S + inverse(Z));
        Z = _k * (Z + inverse(S));
    }

    mat3 R = Apq * inverse(S);

//    following is called a newton iterative method for finding the square roots of a matrix
//    https://www.maths.manchester.ac.uk/~higham/narep/narep305.pdf
//        mat3 _A = S;
//        mat3 _X = S;
//        for(int i = 0; i < 20; i++) {
//            _X = 0.5 * (_X + (inverse(_X) * _A));
//        }
//
//        S = _X;
//
//        mat3 R = Apq * inverse(S);

    mat3 finalMatrix = (uBeta * A) + ((1.0 - uBeta) * R);

    //hack to manually re-orient matrix to be positive if it manages to get inverted..
    float determinantFinal = determinant(finalMatrix);
    if (determinantFinal < 0.0) finalMatrix = -finalMatrix;

    vec3 c = vec3(data.xy, 0.0);

    vMatrixColA = finalMatrix[0];
    vMatrixColB = finalMatrix[1];
    vMatrixColC = finalMatrix[2];

    gl_Position = vec4(data.xy * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
layout(location = 0) out vec4 data1;
layout(location = 1) out vec4 data2;
layout(location = 2) out vec4 data3;
void main() {
    data1 = vec4(vMatrixColA, 1.0);
    data2 = vec4(vMatrixColB, 1.0);
    data3 = vec4(vMatrixColC, 1.0);
}

