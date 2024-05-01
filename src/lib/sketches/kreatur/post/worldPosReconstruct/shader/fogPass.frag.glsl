precision highp float;

uniform sampler2D _BasePass;
uniform sampler2D _Depth;
uniform vec3 _CameraWorldPos;

uniform vec2 _FrustumParams;

uniform float _Near;
uniform float _Far;

uniform float _Time;

varying vec3 vViewRay;
varying vec2 vUv;

#define USING_WORLDPSPACE_POSITION

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * _Near * _Far) / (_Far + _Near - z * (_Far - _Near));
}

vec3 hash32(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

void main() {

    float depth = LinearizeDepth(texture2D(_Depth, vUv).x);

    vec3 col = texture2D(_BasePass, vUv).xyz;

    #ifdef USING_WORLDPSPACE_POSITION
    float depth01 = (depth/_Far);
    vec3 viewRay = vViewRay * depth01;
    vec3 worldPos = viewRay + _CameraWorldPos;
    vec3 lightPos = vec3(3.0, 10.0, 5.0);
    float distToLight = length(lightPos - vec3(worldPos.x, 0.0, worldPos.z));

    float dist01 = distToLight / _Far;
//    float phase = 0.0;

//    float dotProd = 0.0;
//    if(depth <= _Far - 0.1) {
//        phase =  1.0 - smoothstep(0.0, 0.1, abs(fract(_Time * 0.5 - dist01) * 2.0 - 1.0));
//        dotProd = dot(normalize(lightPos-worldPos), vec3(0.0, 1.0, 0.0));
//
//    }

//    float dist = length(worldPos);
    float dist = length(worldPos);
    float fog = smoothstep(0.0, 8.0, dist);

    #else

    float fog = smoothstep(_Near, _Far*0.31, depth);

    #endif

//    col = mix(col, vec3(0.7, 0.8, 0.93), fog);
    col = mix(col, vec3(0.7, 0.8, 0.97), fog);
//    col = mix(col, vec3(0.7, 0.7, 0.8), fog);

    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1300.0);
    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1300.0);
    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;

    gl_FragColor = vec4(col + dither, 1.0);

}
