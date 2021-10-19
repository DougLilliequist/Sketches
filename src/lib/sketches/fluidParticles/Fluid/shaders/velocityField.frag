precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {

    vec2 vel = dt * texture2D(uVelocity, vUv).xy * texelSize;
    float mag = length(vel);
    gl_FragColor = vec4(vel, mag, 1.0);

}
