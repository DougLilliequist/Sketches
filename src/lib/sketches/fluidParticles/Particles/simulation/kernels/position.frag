precision highp float;

uniform sampler2D tMap;
uniform sampler2D _Velocity;
uniform sampler2D _Params;

uniform float _Seed;
uniform float _Aspect;
uniform vec2 _Bounds;
uniform vec2 _Resolution;

varying vec2 vUv;

vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

void main() {

    vec4 pos = texture2D(tMap, vUv);
    vec3 params = texture2D(_Params, vUv).xyz;

    //get normalized position under the assumption that the plane is at origin
    vec2 flowmapCoord = (pos.xy / _Bounds) * 0.5 + 0.5;

    vec2 jitter = hash22(flowmapCoord * 1000.0) * 2.0 - 1.0;



    vec3 vel = texture2D(_Velocity, flowmapCoord).xyz;
//    pos.xyz += vel * 3.0;
//    pos.xyz += (vel * vec3(10.0, 10.0, 2.0)) /mix(0.5, 5.0, params.y);
//    pos.xyz += (vel * vec3(0.005, 0.005, 0.002))  /mix(0.5, 5.0, params.y);
    pos.xyz += (vel * vec3(0.005, 0.005, 0.002))  /mix(1.0, 5.0, params.y);


    float lifeRate = params.x;

    float life = pos.w;

    if(life <= 0.0) {

        life = 1.0;
        //generate random position
        vec2 hash = hash22(vec2(gl_FragCoord.xy * 100.0 + _Seed));
        pos.x = mix(-_Bounds.x, _Bounds.x, hash.x);
        pos.y = mix(-_Bounds.y, _Bounds.y, hash.y);
        pos.z = 0.0;

    }

    life -= mix(0.01, 0.05, lifeRate);

    gl_FragColor = vec4(pos.xyz, life);

}
