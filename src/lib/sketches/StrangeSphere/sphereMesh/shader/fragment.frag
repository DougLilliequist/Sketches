precision highp float;

uniform sampler2D _MatCap;

uniform vec3 cameraPosition;
uniform float _Time;

varying vec3 vNormal;
varying vec3 vTangent;
varying vec2 vUv;
varying vec4 vMvPos;
varying vec3 vPos;
varying float vTarget;

#define LIGHT vec3(0.0, 5.0, 5.0)

vec2 matcap(vec3 eye, vec3 normal) {
    vec3 reflected = reflect(eye, normal);
    float m = 2.8284271247461903 * sqrt(reflected.z + 1.0);
    return reflected.xy / m + 0.5;
}

vec3 hash32(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

void main() {

    vec3 norm = normalize(vNormal);
    vec3 viewDir = normalize(vMvPos.xyz);

    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1387.0);
    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time)*1721.0);
    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;

    vec2 matcapCoord = matcap(viewDir, norm);

    float matcapLight = texture2D(_MatCap, matcapCoord).y;
    // matcapLight = matcapLight*matcapLight*matcapLight*matcapLight*matcapLight;
    matcapLight = matcapLight*matcapLight;
    // matcapLight *= 1.2;

    float halfLambert = dot(norm, normalize(LIGHT))*0.5+0.5;
    // halfLambert = halfLambert*halfLambert;

    float fresnel = 1.0-(dot(-viewDir, norm)*0.5+0.5);
    fresnel = fresnel * fresnel*fresnel*fresnel;
    fresnel *= 1.0;

    float fog = smoothstep(8.0, 4.0, vMvPos.z*vMvPos.z);
    // vec3 col = mix(vec3(0.12342, 0.134, 0.9312), vec3(0.95, 0.134, 0.1312), halfLambert);
    vec3 col = mix(norm * 0.5 + 0.5, vec3(halfLambert), 1.0-fresnel);
    // col *= halfLambert + matcapLight;
    // col += matcapLight*.3;

    gl_FragColor = vec4(vec3(matcapLight), 1.0);
    // gl_FragColor = vec4(vec3(matcapLight*(halfLambert+fresnel)), 1.0);
    // gl_FragColor = vec4(vec3(vTarget), 1.0);
    // gl_FragColor = vec4(vec3(halfLambert), 1.0);
    //gl_FragColor = vec4(vec3(mix(vec3(0.0), col, halfLambert*halfLambert)), 1.0);

}
