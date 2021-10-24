precision highp float;
precision highp sampler2D;

uniform sampler2D tMap;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
uniform sampler2D uSource;
void main () {

    vec2 vel = texture2D(uVelocity, vUv).xy * texelSize;
    float mag = length(vel);
    vec3 finalVel = vec3(vel, mag);
    gl_FragColor = vec4(finalVel, 1.0);

}
