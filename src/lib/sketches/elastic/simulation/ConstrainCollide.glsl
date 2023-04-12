#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tPredictedPosition;
uniform sampler2D tInitPositions;
uniform sampler2D tInitRelativePosition;
uniform sampler2D tCurrentCenterOfMass;
uniform sampler2D tInteractionData;

uniform float uAlpha;

uniform float uApplyInput;

uniform vec3 uHitData;
uniform vec3 uRayOrigin;
uniform vec3 uRayDirection;

uniform vec3 uBoundsMin;
uniform vec3 uBoundsMax;

uniform float uTextureSize;
uniform float uVertexCount;

uniform float uDeltaTime;

#!VARYINGS
varying vec3 vCorrectedPos;

#!SHADER: Vertex
#require(getCoord.glsl)

float falloff(float distance, float radius) {
    float t = clamp(distance / radius, 0.0, 1.0);
//    return 1.0 - smoothstep(0.0, 1.0, t);
//    return max(0.0, 1.0 - pow((distance / radius), 2.0));
    float p = (distance / radius);
    return exp(-p * p);
}


void main() {
    float index = float(gl_VertexID);
    vec2 coord = getCoord(index, uTextureSize);

//    float compliance = 1000.0 / uDeltaTime / uDeltaTime;
//    compliance = 1.0 / (1.0 + 2.0);
    float compliance = 1.0 / (1.0 + 30.0);

    vec3 correction = vec3(0.0);

    vec3 pos = texture2D(tPredictedPosition, coord).xyz;

    vec4 initPositions = texture2D(tInitPositions, coord);
    float restLength = initPositions.w;
    vec3 dir = pos - initPositions.xyz;
    float len = length(dir);
    dir /= len;
//    float r = restLength * 0.01;
    float r = 0.035 * restLength * 0.5;
//    float strength = restLength / length(uBoundsMax);
//    strength = exp(-strength * strength) * 0.5;
//    if(len > r) correction -= dir * (len - r) * 0.1 * restLength * mix(0.01, 0.1, uApplyInput);
    correction -= dir * (len - r) * (restLength * mix(0.0015, 0.05, uApplyInput));
//    correction -= dir * (len - r) * (0.5 * mix(0.0025, 0.05, uApplyInput));

    pos += correction;

    if((uApplyInput > 0.0) && (uHitData.x > -1.0)) {
        vec3 targetPosition = uRayOrigin + uRayDirection * (uHitData.y * 0.925);
        vec3 grabDir = targetPosition - pos;
        float dist = length(grabDir);
        float restLen = texture2D(tInteractionData, coord).x;
        float falloffValue = falloff(restLen, 0.125);
        grabDir /= dist;
        if(dist > 0.0 && (dist > restLen)) pos += (dist - restLen) * grabDir * falloffValue;
    }

    if(pos.y < uBoundsMin.y) {
        pos.y = uBoundsMin.y;
    }

    if(pos.y > uBoundsMin.y) {
//        pos.y = uBoundsMin.y;
    }

    vCorrectedPos = pos;

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vCorrectedPos, 1.0);
}
