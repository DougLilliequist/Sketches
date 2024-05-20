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

out vec3 vPos;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    ivec2 iCoord = ivec2(coord * uSize);

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    vec3 pos = texelFetch(tPositions, iCoord, 0).xyz;
    vec3 initPos = texelFetch(tInitPositions, iCoord, 0).xyz;
    float initRestLength = texelFetch(tInitRestLengths, iCoord, 0).x;

    vec3 initPosContraintDir = initPos - pos;
    float constraintDist = length(initPosContraintDir);
//    float r = 0.2 + initRestLength * 0.01;
    float r = mix(0.2, 0.0, uIsDragging) + initRestLength * mix(0.01, 0.5, uIsDragging);
    if(constraintDist > r) {
        initPosContraintDir /= constraintDist;
        pos += normalize(initPosContraintDir) * (constraintDist - r) * 0.01;
    }


    if((uIsDragging > 0.5) && (uPickedIndex >= 0.0)) {
        float pickedRestLength = texelFetch(tPickedRestLengths, iCoord, 0).x;
        ivec2 targetCoord = ivec2(calcCoordFromIndex(uPickedIndex, uSize) * uSize);
        vec3 target = texelFetch(tPositions, targetCoord, 0).xyz;

        vec3 dir = uHitPoint - pos;
        float dist = length(dir);
        if(dist > pickedRestLength) {
            dir /= dist;

            float distPhase = smoothstep(0.0, 1.0, pickedRestLength / 2.0);

            pos += dir * (dist - pickedRestLength) * exp(-pickedRestLength * pickedRestLength) / 1.0;
//            pos += dir * (dist - pickedRestLength) * (1.0 - smoothstep(0.0, 2.0, pickedRestLength));
//            pos += dir * (dist - pickedRestLength) * (1.0 - smoothstep(0.0, 3.0, pickedRestLength)) * exp(-pickedRestLength * pickedRestLength);
        }
    }

    vPos = pos;

}
