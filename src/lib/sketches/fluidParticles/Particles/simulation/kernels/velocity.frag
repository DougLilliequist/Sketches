precision highp float;

uniform sampler2D tMap;
uniform sampler2D _Position;
uniform sampler2D _Fluid;

uniform sampler2D _Params;

uniform float _Seed;
uniform float _Aspect;
uniform vec2 _Bounds;

varying vec2 vUv;

vec2 hash22(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

void main() {

    vec4 pos = texture2D(_Position, vUv);

    //get normalized position under the assumption that the plane is at origin
    vec2 flowmapCoord = (pos.xy / _Bounds) * 0.5 + 0.5;
    vec3 fluidVel = texture2D(_Fluid, flowmapCoord).xyz;

    fluidVel /= 50.0;
    fluidVel *= 0.01;

    vec3 vel = texture2D(tMap, vUv).xyz;

    vel += fluidVel;

    vel += vec3(0.0, 0.0, -0.005);

    vel *= 0.98;

    gl_FragColor = vec4(vel, 1.0);

}
