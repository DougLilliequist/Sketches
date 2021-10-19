precision highp float;
precision highp sampler2D;

uniform sampler2D tMap;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {

    vec3 currentVelocity = texture2D(tMap, vUv).xyz;

//    vec2 vel = dt * texture2D(uVelocity, vUv).xy * texelSize;
    vec2 vel = dt * texture2D(uVelocity, vUv).xy;
    float mag = length(vel);

    vec3 finalVel = vec3(vel, mag);

    currentVelocity += finalVel;

    currentVelocity *= 0.97;

    gl_FragColor = vec4(currentVelocity, 1.0);

}
