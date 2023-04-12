#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tPositionData;
uniform float uTextureSize;
uniform vec2 uCameraFarNear;

uniform vec3 uRayOrigin;
uniform vec3 uRayDirection;

#!VARYINGS
varying vec3 vData;

#!SHADER: Vertex
#require(getCoord.glsl)
#define EPS 0.0001
void main() {

    vec3 indicies = position.xyz; //position in this case contains the indivies that makes up a triangle
    float dist = uCameraFarNear.x - uCameraFarNear.y;
    float index = -1.0;
    float isHit = 0.0;

    vec3 v0 = texture2D(tPositionData, getCoord(indicies.x, uTextureSize)).xyz;
    vec3 v1 = texture2D(tPositionData, getCoord(indicies.y, uTextureSize)).xyz;
    vec3 v2 = texture2D(tPositionData, getCoord(indicies.z, uTextureSize)).xyz;

    vec3 e1 = v1 - v0;
    vec3 e2 = v2 - v0;

    vec3 P = cross(uRayDirection, e2);
    float det = dot(e1, P); //check if ray is parallale to triangle face's surface / plane
    if(abs(det) > EPS) {

        vec3 T = uRayOrigin - v0;
        float f = 1.0 / det;

        //barycentric corodinate u
        float u = dot(T, P) * f;

        if(u >= 0.0 && u <= 1.0) {

            vec3 Q = cross(T, e1);
            float v = dot(uRayDirection, Q) * f;

            if(v >= 0.0 && v <= 1.0 && u + v <= 1.0) {

                float t = f * dot(e2, Q);
                if(t > EPS) {

                    vec3 intersectionPoint = uRayOrigin + uRayDirection * t;
                    float intersection_distance = length(intersectionPoint - uRayOrigin);
                    if(((1.0 - u - v) >= u) && ((1.0 - u - v) >= v)) {
                        index = position.x;
                        dist = intersection_distance;
                    } else if(u >= v) {
                        index = position.y;
                        dist = intersection_distance;
                    } else {
                        index = position.z;
                        dist = intersection_distance;
                    }

                    isHit = 1.0;

                }

            }

        }


    }

    vData = vec3(index, dist, isHit);
    gl_Position = vec4(vec3(0.5, 0.5, dist / uRayOrigin.z), 1.0);
    gl_PointSize = 1.0;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vData, 1.0);
}
