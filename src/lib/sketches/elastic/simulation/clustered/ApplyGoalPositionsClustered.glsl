#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tSolvedPosition;
uniform sampler2D tInitRelativePosition;
uniform sampler2D tCurrentCenterOfMass;

uniform sampler2D tRotationMatrixColA;
uniform sampler2D tRotationMatrixColB;
uniform sampler2D tRotationMatrixColC;

uniform float uAlpha;

uniform float uTextureSize;
uniform float uDeltaTime;

uniform float uTileCount;
uniform float uTileSize;
uniform float uBucketCount;

#!VARYINGS
varying vec3 vPos;

#!SHADER: Vertex
#require(getCoord.glsl)

vec3 getGoalPosition(float vertexIndex, float bucketIndex, in vec3 pos, out float inCluster) {

    vec2 localTileCoord = getCoord(vertexIndex, uTextureSize) * (1.0 / uTileCount);

    float offsetX = mod(bucketIndex, uTileCount) / uTileCount;
    float offsetY = floor(bucketIndex / uTileCount) / uTileCount;
    vec2 tileCoord = vec2(offsetX, offsetY);

    vec2 coord = localTileCoord + tileCoord;
    vec4 centerOfMass = texture2D(tCurrentCenterOfMass, getCoord(bucketIndex, uTileCount));

    //w contains cluster count
    if((centerOfMass.w - 1.0) <= 0.0) {
        inCluster = 0.0;
        return vec3(0.0);
    }

    centerOfMass /=  max(1.0, (centerOfMass.w - 1.0));

    vec4 initRelativePosition = texture2D(tInitRelativePosition, coord); //w contains cluster count

    //check if there is any data present, if not: return no goal position
    if(dot(initRelativePosition.xyz, initRelativePosition.xyz) <= 0.0) {
        inCluster = 0.0;
        return vec3(0.0);
    }
    tileCoord = getCoord(bucketIndex, uTileCount);

    mat3 rotationMatrix = mat3(0.0);
    rotationMatrix[0] = texture2D(tRotationMatrixColA, tileCoord).xyz;
    rotationMatrix[1] = texture2D(tRotationMatrixColB, tileCoord).xyz;
    rotationMatrix[2] = texture2D(tRotationMatrixColC, tileCoord).xyz;
    vec3 goalPosition = (rotationMatrix * initRelativePosition.xyz) + centerOfMass.xyz;

    inCluster = 1.0;
    return uAlpha * (goalPosition - pos);
}

void main() {
    float index = float(gl_VertexID);
    vec2 coord = getCoord(index, uTextureSize);

    vec3 pos = texture2D(tSolvedPosition, coord).xyz;
    vec3 finalGoalPos = vec3(0.0);
    float clusterCountSum = 0.0;
    float clusterCount = 0.0;
    for(float i = 0.0; i < uBucketCount; i++) {
        float inCluster;
        finalGoalPos += getGoalPosition(index, i, pos, inCluster);
        clusterCount += inCluster;
    }
    float compliance = 1.0 / (1.0 + 0.0);
    if(clusterCount > 0.0) pos += finalGoalPos * (1.0 / clusterCount) * compliance;
//    if(clusterCount > 0.0) pos += finalGoalPos * compliance;

    vPos = pos;

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vPos, 1.0);
}
