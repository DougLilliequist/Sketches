precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

uniform sampler2D tRipple;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPos;

#define PI 3.1415926535

vec3 hash33(vec3 p3)
{
    p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);

}

vec4 hash43(vec3 p)
{
    vec4 p4 = fract(vec4(p.xyzx)  * vec4(.1031, .1030, .0973, .1099));
    p4 += dot(p4, p4.wzxy+33.33);
    return fract((p4.xxyz+p4.yzzw)*p4.zywx);
}

mat2 rotate2D(float a) {
    return mat2(
    cos(a), -sin(a),
    sin(a), cos(a));
}


void main() {
    vNormal = normalMatrix * normal;
    vUv = uv;
    vec3 localPos = position;

    float ripple = texture2D(tRipple, uv).x;
    vec3 distort =  (normal) * ripple;

    vPos = position;

    vec3 finalPos = localPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
//    gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);
}
