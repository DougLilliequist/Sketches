#version 300 es
precision highp float;

uniform sampler2D tPosition;
//uniform sampler2D tConstraints;
uniform sampler2D tPrevPosition;

uniform float uDeltaTime;
uniform vec2 uTexelSize;

in vec2 vUv;
out vec4 FragColor;

void main() {

    vec3 pos = texture(tPosition, vUv).xyz;

//    vec3 correction = texture(tConstraints, vUv).xyz;
//    pos += correction * (0.25 * 0.25);

    vec3 prevPos = texture(tPrevPosition, vUv).xyz;
    vec3 vel = (pos - prevPos) / uDeltaTime;
    FragColor = vec4(vel, 1.0);

}
