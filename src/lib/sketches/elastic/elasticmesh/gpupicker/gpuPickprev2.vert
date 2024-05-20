#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tPosition;

uniform vec3 uRayDirection;
uniform vec3 uRayOrigin;
uniform float uSize;

out vec4 vData;

#define EPS 1.0e-9

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    vec4 data = vec4(999.0, 999.0, 999.0, -1.0);

    vec3 pA = texelFetch(tPosition, ivec2(calcCoordFromIndex(position.x, uSize) * uSize), 0).xyz;
    vec3 pB = texelFetch(tPosition, ivec2(calcCoordFromIndex(position.y, uSize) * uSize), 0).xyz;
    vec3 pC = texelFetch(tPosition, ivec2(calcCoordFromIndex(position.z, uSize) * uSize), 0).xyz;

    vec3 edgeA = pB - pA;
    vec3 edgeB = pC - pA;

    vec3 rayDirXedgeB = cross(uRayDirection, edgeB);
    float det = dot(edgeA, rayDirXedgeB);
    float z = 1.0;

    if(abs(det) > EPS) {

        float invDet = 1.0 / det;
        vec3 s = uRayOrigin - pA;
        float u = invDet * dot(s, rayDirXedgeB);

        if(u >= 0.0 || u <= 1.0) {

            vec3 sXedgeA = cross(s, edgeA);
            float v = invDet * dot(uRayDirection, sXedgeA);

            if(v >= 0.0 || (u + v) <= 1.0) {

                float t = invDet * dot(edgeB, sXedgeA);
                if(t > EPS) {

                    vec3 hitPoint = uRayOrigin + uRayDirection * t;
                    float hitPointLen = length(hitPoint - uRayOrigin);
                    hitPoint = uRayOrigin + uRayDirection * hitPointLen;

                    z = 0.0; //put point in front

                    //pick point with smallest distance to hit point
                    float minDist = 9999.0;
                    vec3 points[3] = vec3[3](pA, pB, pC);
                    float indices[3] = float[3](position.x, position.y, position.z);
                    vec3 desiredPoint;
                    float desiredIndex;

                    for(int i = 0; i < 3; i++) {

                        float dist = length(hitPoint - points[i]);

                        if(dist < minDist) {
                            minDist = dist;
                            desiredPoint = points[i];
                            desiredIndex = indices[i];
                        }

                    }

                    data.xyz = desiredPoint;
                    data.w = desiredIndex;

                }

            }

        }

    }

    vData = data;

    gl_Position = vec4(0.5, 0.5, 0.0, 1.0);
    gl_PointSize = z;

}
