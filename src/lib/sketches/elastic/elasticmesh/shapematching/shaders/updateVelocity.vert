#version 300 es
precision highp float;

in vec3 position;

uniform sampler2D tPosition;
uniform sampler2D tPrevPosition;

uniform float uSize;
uniform float uDt;
uniform float uInertia;

out vec3 vVelocity;

vec2 calcCoordFromIndex(in float index, in float size) {
    x = (mod(index, size) + 0.5) / size;
    y = (floor(index / size) + 0.5) / size;
    return vec2(x, y);
}

void main() {
    float index = float(gl_VertexID);
    vec2 coord = calcCoordFromIndex(index, uSize);
    vec2 iCoord = ivec2(coord * uSize);

    gl_Position = vec4(2.0 * coord - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    vec3 currentPos = texelFetch(tPosition, iCoord, 0).xyz;
    vec3 prevPos = texelFetch(tPrevPosition, iCoord, 0).xyz;

    vec3 velocity = (currentPos - prevPos) / uDt;
    velocity *= uInertia;

    //hack to prevent drift
    if(length(velocity) < 0.0001) velocity = vec3(0.0);

    vVelocity = velocity;

}
