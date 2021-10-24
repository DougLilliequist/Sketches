precision highp float;

uniform sampler2D _Position;
uniform sampler2D _Fluid;

uniform mat4 _ViewProjectionMatrix;

uniform sampler2D _Params;
uniform vec2 _Bounds;

varying vec2 vUv;

#define FLOWSTR 0.00055

void main() {

    vec2 pos = texture2D(_Position, vUv).xy;
    float param = texture2D(_Params, vUv).x;

    vec4 clipPos = _ViewProjectionMatrix * vec4(pos.x, pos.y, 0.0, 1.0);
    clipPos /= clipPos.w;
    clipPos.xy = clipPos.xy * 0.5 + 0.5;


    //get normalized position under the assumption that the plane is at origin
    vec2 flowmapCoord = (pos.xy / _Bounds) * 0.5 + 0.5;
    vec3 fluidVel = texture2D(_Fluid,clipPos.xy).xyz;

    fluidVel *= vec3(FLOWSTR, FLOWSTR, FLOWSTR * 0.5) * mix(1.25, 0.2, param);
//    fluidVel *= vec3(0.05, 0.05, 0.02) * mix(1.0, 0.5, params.y);

    gl_FragColor = vec4(fluidVel, 1.0);

}
