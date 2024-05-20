#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tPosition;

uniform vec3 uRayDirection;
uniform vec3 uRayOrigin;
uniform float uSize;

out vec4 vData;

vec2 calcCoordFromIndex(in float index, in float size) {
    float x = (mod(index, size) + 0.5) / size;
    float y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {

    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    ivec2 iCoord = ivec2(coord * uSize);

    vec3 pos = texelFetch(tPosition, iCoord, 0).xyz;

    vec3 dir = pos - uRayOrigin;

    float projection = dot(dir, normalize(uRayDirection));
    vec3 projectedPos = (normalize(uRayDirection) * projection) + uRayOrigin;
    float inputDist = length(pos - projectedPos);

    vec4 data = vec4(999.0, 999.0, 999.0, -1.0);
    float z = inputDist / 100.0;
//    if(inputDist < 0.03) {
//        data.w = index;
//        data.xyz = pos;
//        z = 0.0;
//    }

    vData = vec4(pos.xyz, index);

    gl_Position = vec4(0.5, 0.5, z, 1.0);
    gl_PointSize = 1.0;

}
