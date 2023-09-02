#version 300 es

precision highp float;

uniform sampler2D tPosition;

uniform vec2 uRestLength;
uniform float uStiffness;

uniform vec3 uInputPos;
uniform float uApplyInput;

uniform vec2 uTexelSize;
uniform float uDeltaTime;

uniform vec3 uOrigin;

in vec2 vUv;

out vec4 data[2];

void main() {

    vec3 pos = texture(tPosition, vUv).xyz;
    vec3 correction = vec3(0.0);
    vec3 ftlCorrection = vec3(0.0);

    //from müllers examples...complience should be a large number?
    float compliance = 0.00001 / uDeltaTime / uDeltaTime;
//    float compliance = 0.00005 / uDeltaTime / uDeltaTime;

    if(vUv.x > uTexelSize.x) {

        vec3 fromBody = pos.xyz - uOrigin;
        float len = length(fromBody);

        float bodyR = 0.3;
//        if(len > 0.0 && len < bodyR) correction += (fromBody/len) * (bodyR - len) * 0.5;

        vec3 target = texture(tPosition, vec2(vUv.x - uTexelSize.x, vUv.y)).xyz;
        vec3 dir = target - pos.xyz;
        float mag = length(dir);

        float restLen = uRestLength.x * uStiffness;
        if(mag > restLen) {
            ftlCorrection = (dir/mag) * (mag - restLen);
            ftlCorrection /= (2.0 + compliance);
            correction.xyz += ftlCorrection;
        }
    }

    pos += correction;

    data[0] = vec4(pos, 1.0);
    data[1] = vec4(ftlCorrection, 1.0);

}
