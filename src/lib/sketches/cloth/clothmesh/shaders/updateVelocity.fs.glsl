#version 300 es
precision highp float;

uniform sampler2D tPosition;
uniform sampler2D tPrevPosition;

uniform float uInertia;

uniform float uDeltaTime;
uniform vec2 uTexelSize;

in vec2 vUv;
out vec4 FragColor;

void main() {

    vec3 pos = texture(tPosition, vUv).xyz;
    vec3 prevPos = texture(tPrevPosition, vUv).xyz;
    vec3 vel = (pos - prevPos) / uDeltaTime;
    vel *= 0.9995; //0.9996

    FragColor = vec4(vel, 1.0);

}
