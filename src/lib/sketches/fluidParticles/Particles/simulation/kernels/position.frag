precision highp float;

uniform sampler2D tMap;
uniform sampler2D _Velocity;
uniform sampler2D _Params;

uniform float _Seed;
uniform vec2 _Bounds;

varying vec2 vUv;

#define PI 3.14159265359
#define TAU 3.14159265359 * 2.0
#define RADIUS 0.7
#define ZOFFSET 0.05
#define LIFEMIN 0.01
#define LIFEMAX 0.05

vec2 hash22(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

vec3 hash32(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

void main() {

    vec4 pos = texture2D(tMap, vUv);
    float param = texture2D(_Params, vUv).x;

    vec3 vel = texture2D(_Velocity, vUv).xyz;

    pos.xyz += vel;
    pos.z = 0.0;

    float lifeRate = param;

    float life = pos.w;

    if(life <= 0.0) {

        life = 1.0;
        //generate random position
        vec3 hash = hash32(vec2(gl_FragCoord.xy * 10.0 + _Seed));
        float x = cos(hash.x * TAU) * hash.y;
        float y = sin(hash.x * TAU) * hash.y;
        pos.x = x * _Bounds.y * RADIUS;
        pos.y = y * _Bounds.y * RADIUS;
        pos.z = mix(-ZOFFSET, ZOFFSET, hash.z);

    }

    life -= mix(LIFEMIN, LIFEMAX, lifeRate);

    gl_FragColor = vec4(pos.xyz, 0.5);

}


