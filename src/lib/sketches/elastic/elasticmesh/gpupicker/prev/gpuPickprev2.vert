#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tPosition;

uniform vec3 uRayDirection;
uniform vec3 uRayOrigin;
uniform float uSize;

out vec4 vData;

#define EPS 1.0e-9
//#define EPS 0.00001

// Function to calculate the barycentric coordinates of a point within a triangle
vec3 getBarycoord(vec3 point, vec3 a, vec3 b, vec3 c) {
    vec3 v0 = c - a;
    vec3 v1 = b - a;
    vec3 v2 = point - a;
    float dot00 = dot(v0, v0);
    float dot01 = dot(v0, v1);
    float dot02 = dot(v0, v2);
    float dot11 = dot(v1, v1);
    float dot12 = dot(v1, v2);
    float denom = dot00 * dot11 - dot01 * dot01;
    if (denom == 0.0) return vec3(-2.0, -1.0, -1.0);
    float invDenom = 1.0 / denom;
    float u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    float v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    return vec3(1.0 - u - v, v, u);
}

// Function to perform ray-triangle intersection
float intersectTriangle(vec3 a, vec3 b, vec3 c, vec3 origin, vec3 direction, bool backfaceCulling) {
    vec3 edge1 = b - a;
    vec3 edge2 = c - a;
    vec3 normal = cross(edge1, edge2);
    float DdN = dot(direction, normal);
    if (abs(DdN) < EPS) return 0.0; // Ray is parallel to the triangle plane

    float sign = DdN > 0.0 ? 1.0 : -1.0;
    if (DdN > 0.0 && backfaceCulling) return 0.0;
    DdN = abs(DdN);

    vec3 diff = origin - a;
    float DdQxE2 = sign * dot(direction, cross(diff, edge2));
    if (DdQxE2 < 0.0) return 0.0;
    float DdE1xQ = sign * dot(direction, cross(edge1, diff));
    if (DdE1xQ < 0.0) return 0.0;
    if (DdQxE2 + DdE1xQ > DdN) return 0.0;

    float QdN = -sign * dot(diff, normal);
    if (QdN < 0.0) return 0.0;
    return QdN / DdN;
}

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

    float t = intersectTriangle(pA, pB, pC, uRayOrigin, uRayDirection, true);
    float z = 0.0;
    if(t > EPS) {
        vec3 hitPoint = uRayOrigin + uRayDirection * t;
        vec3 baryCoord = getBarycoord(hitPoint, pA, pB, pC);

        // Output the hit point and the barycentric coordinates for debugging
//        vData = vec4(hitPoint, 1.0);
        z = 1.0;
        // Or alternatively, output barycentric coordinates
         vData = vec4(baryCoord, 1.0);
    }

//    vec3 edgeA = pB - pA;
//    vec3 edgeB = pC - pA;
//
//    vec3 rayDir = normalize(uRayDirection);
//    vec3 rayDirXedgeB = cross(rayDir, edgeB);
//    float det = dot(edgeA, rayDirXedgeB);
//    float z = 0.0;
//
//    if(abs(det) > EPS) {
//
//        float invDet = 1.0 / det;
//        vec3 s = uRayOrigin - pA;
//        float u = invDet * dot(s, rayDirXedgeB);
//
//        if(u >= 0.0 || u <= 1.0) {
//
//            vec3 sXedgeA = cross(s, edgeA);
//            float v = invDet * dot(rayDir, sXedgeA);
//
//            if(v >= 0.0 || (u + v) <= 1.0) {
//
//                float t = invDet * dot(edgeB, sXedgeA);
//                if(t > EPS) {
//
//                    vec3 hitPoint = uRayOrigin + rayDir * t;
//                    data.xyz = hitPoint;
//                    data.w = 1.0;
//                    z = 1.0; //put point in front
//
//                }
//
//            }
//
//        }
//
//    }
//
//    vData = data;

    gl_Position = vec4(0.5, 0.5, 0.0, 1.0);
    gl_PointSize = z;

}
