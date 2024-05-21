#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tPositions;
uniform sampler2D tInitPositions;
uniform sampler2D tInitRestLengths;
uniform sampler2D tPickedRestLengths;

uniform vec3 uHitPoint;
uniform float uIsDragging;
uniform float uPickedIndex;
uniform float uSize;
uniform vec2 uAngle;

out vec3 vPos;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

mat2 rotate2D(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    ivec2 iCoord = ivec2(coord * uSize);

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    vec3 pos = texelFetch(tPositions, iCoord, 0).xyz;
    vec3 initPos = texelFetch(tInitPositions, iCoord, 0).xyz;

    //ROTATE THE INITIAL POSITIONS
    initPos.xz = rotate2D(uAngle.x * 0.75) * initPos.xz;
    initPos.yz = rotate2D(uAngle.y * 0.75) * initPos.yz;


    float initRestLength = texelFetch(tInitRestLengths, iCoord, 0).x;

    vec3 initPosContraintDir = initPos - pos;
    float constraintDist = length(initPosContraintDir);
//    float r = 0.2 + initRestLength * 0.01;
//    float r = mix(0.2, 0.0, uIsDragging) + initRestLength * mix(0.01, 0.5, uIsDragging);
    float r = mix(0.2, 0.0, uIsDragging) + initRestLength * mix(0.01, 0.05, uIsDragging);
//    r = 0.001;
    if(constraintDist > r) {
        initPosContraintDir /= constraintDist;
        pos += normalize(initPosContraintDir) * (constraintDist - r) * 0.01;
    }


    if((uIsDragging > 0.5) && (uPickedIndex > -1.0)) {
        float pickedRestLength = texelFetch(tPickedRestLengths, iCoord, 0).x;
//        ivec2 targetCoord = ivec2(calcCoordFromIndex(uPickedIndex, uSize) * uSize);
//        vec3 target = texelFetch(tPositions, targetCoord, 0).xyz;

        vec3 dir = uHitPoint - pos;
        float dist = length(dir);
        if(dist > pickedRestLength) {
            dir /= dist;

            float distPhase = smoothstep(0.0, 1.0, pickedRestLength / 2.0);

//            pos += dir * (dist - pickedRestLength) * exp(-pickedRestLength * pickedRestLength);
            pos += dir * (dist - pickedRestLength) * (1.0 - smoothstep(0.0, 1.5, pickedRestLength)) * exp(-pickedRestLength * pickedRestLength);
//            pos += dir * (dist - pickedRestLength) * (1.0 - smoothstep(0.0, 5.0, pickedRestLength)) * exp(-pickedRestLength * pickedRestLength);
//            pos += dir * (dist - pickedRestLength) * (1.0 - smoothstep(0.0, 3.0, pickedRestLength)) * exp(-pickedRestLength * pickedRestLength);
        }
    }

    vPos = pos;

}
