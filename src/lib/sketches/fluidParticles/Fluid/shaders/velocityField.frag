//precision highp float;
//precision highp sampler2D;
//
//uniform sampler2D tMap;
//varying vec2 vUv;
//uniform sampler2D uVelocity;
//uniform vec2 texelSize;
//uniform float dt;
//uniform float dissipation;
//uniform sampler2D uSource;
//void main () {
//
//    vec3 currentVelocity = texture2D(tMap, vUv).xyz;
//
////    vec2 vel = dt * texture2D(uVelocity, vUv).xy * texelSize;
//    vec2 vel = dt * texture2D(uVelocity, vUv).xy;
//    float mag = length(vel);
//
//    float mask = texture2D(uSource, vUv).x;
//
//    vec3 finalVel = vec3(vel, mag);
//
//    currentVelocity += finalVel;
//
//    currentVelocity *= 0.97;
//
//    gl_FragColor = vec4(currentVelocity, 1.0);
//
//}
//
//

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

    vec3 currentVelocity = texture2D(tMap, vUv).xyz;

//    vec2 vel = dt * texture2D(uVelocity, vUv).xy * 0.25;
    vec2 vel = dt * texture2D(uVelocity, vUv).xy;
    float mag = length(vel);

    float mask = texture2D(uSource, vUv).x;

    vec3 finalVel = vec3(vel, mag);

    currentVelocity += finalVel;

    currentVelocity *= 0.80;

    gl_FragColor = vec4(currentVelocity, 1.0);

}
