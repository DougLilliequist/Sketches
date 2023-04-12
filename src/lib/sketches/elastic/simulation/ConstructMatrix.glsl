#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tAPQColA;
uniform sampler2D tAPQColB;
uniform sampler2D tAPQColC;

uniform sampler2D tAQQColA;
uniform sampler2D tAQQColB;
uniform sampler2D tAQQColC;

uniform float uBeta;
uniform float uTextureSize;

#!VARYINGS

#!SHADER: Vertex
void main() {
    gl_Position = vec4(position, 1.0);
}

    #!SHADER: Fragment
layout(location = 0) out vec4 data1;
layout(location = 1) out vec4 data2;
layout(location = 2) out vec4 data3;
void main() {
    mat3 Apq = mat3(0.0);
    Apq[0] = texture2D(tAPQColA, vec2(0.5)).xyz;
    Apq[1] = texture2D(tAPQColB, vec2(0.5)).xyz;
    Apq[2] = texture2D(tAPQColC, vec2(0.5)).xyz;

    mat3 Aqq = mat3(0.0);
    Aqq[0] = texture2D(tAQQColA, vec2(0.5)).xyz;
    Aqq[1] = texture2D(tAQQColB, vec2(0.5)).xyz;
    Aqq[2] = texture2D(tAQQColC, vec2(0.5)).xyz;

    Aqq = inverse(Aqq);
    mat3 A = Apq * Aqq; //note the inverse of AQQ can be pre-computed

    //this one will for sure break the whole simulation as I have no idea what a jacobi rotation is and
    //according to the paper, it is required...
    mat3 ATpq = transpose(Apq);
    mat3 S = ATpq * Apq;
//    mat3 Y = ATpq * Apq;
    mat3 Z = mat3(
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    );

//    //denman-beavers iterative solver for square root matrices
    for(int i = 0; i < 60; i++) {
        Z = 0.5 * (Z + inverse(S));
        S = 0.5 * (S + inverse(Z));
    }

    mat3 R = Apq * inverse(S);

    //following is called a newton iterative method for finding the square roots of a matrix
    //https://www.maths.manchester.ac.uk/~higham/narep/narep305.pdf
//    mat3 _A = S;
//    mat3 _X = S;
//    for(int i = 0; i < 10; i++) {
//        _X = 0.5 * (_X + (inverse(_X) * _A));
//    }
//
//    S = _X;
//
//    mat3 R = Apq * inverse(S);

    mat3 finalMatrix = (uBeta * A) + ((1.0 - uBeta) * R);

    //hack to manually re-orient matrix to be positive if it manages to get inverted..
    float determinantFinal = determinant(finalMatrix);
    if (determinantFinal < 0.0) finalMatrix = -finalMatrix;

    data1 = vec4(finalMatrix[0], 1.0);
    data2 = vec4(finalMatrix[1], 1.0);
    data3 = vec4(finalMatrix[2], 1.0);
}
