#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tNormal;

uniform sampler2D tRotationMatrixColA;
uniform sampler2D tRotationMatrixColB;
uniform sampler2D tRotationMatrixColC;

uniform float uTextureSize;

uniform float uTileCount;
uniform float uTileSize;
uniform float uBucketCount;

#!VARYINGS
varying vec3 vNormal;

#!SHADER: Vertex
#require(getCoord.glsl)

vec3 getRotatedNormal(in float vertexIndex, in float bucketIndex, out float inCluster) {

    vec2 localTileCoord = getCoord(vertexIndex, uTextureSize) * (1.0 / uTileCount);

    float offsetX = mod(bucketIndex, uTileCount) / uTileCount;
    float offsetY = floor(bucketIndex / uTileCount) / uTileCount;
    vec2 tileCoord = vec2(offsetX, offsetY);

    vec2 coord = localTileCoord + tileCoord;

    vec3 relativeNormal = texture2D(tNormal, coord).xyz;
    if(dot(relativeNormal, relativeNormal) <= 0.0) {
        inCluster = 0.0;
        return vec3(0.0);
    }

    tileCoord = getCoord(bucketIndex, uTileCount);

    mat3 R = mat3(0.0);
    R[0] = texture2D(tRotationMatrixColA, tileCoord).xyz;
    R[1] = texture2D(tRotationMatrixColB, tileCoord).xyz;
    R[2] = texture2D(tRotationMatrixColC, tileCoord).xyz;

    inCluster = 1.0;
    return R * relativeNormal;

}

void main() {
    float index = float(gl_VertexID);
    vec2 coord = getCoord(index, uTextureSize);

    float clusterCount = 0.0;
    vec3 normal = vec3(0.0);

    for(float i = 0.0; i < uBucketCount; i++) {
        float inCluster;
        normal += getRotatedNormal(index, i, inCluster);
        clusterCount += inCluster;
    }

    if(clusterCount > 0.0) normal * (1.0 / clusterCount);
//    if(clusterCount > 0.0) normal;
    vNormal = clusterCount > 0.0 ? normalize(normal) : vec3(0.0);

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vNormal, 1.0);
}
