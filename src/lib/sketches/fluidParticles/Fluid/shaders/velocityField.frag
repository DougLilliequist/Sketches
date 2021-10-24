precision highp float;
precision highp sampler2D;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 texelSize;
uniform float dt;
void main () {

    vec2 vel = texture2D(uVelocity, vUv).xy;
    float mag = length(vel);
    vec3 finalVel = vec3(vel, mag);
    gl_FragColor = vec4(finalVel, 1.0);

}
