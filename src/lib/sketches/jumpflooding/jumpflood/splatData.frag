precision mediump float;

uniform sampler2D tMap;

varying vec2 vUv;

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
    vec2 uv = vUv;
    uv -= 0.5;
    uv *= 1.0;
    uv += 0.5;
    vec4 data = texture2D(tMap, uv);

    vec3 hash = hash32(vUv.xy * 1000.0);
    hash.xy = floor(gl_FragCoord.xy * hash.xy) / 64.0;
    hash.z = step(0.99, hash.z);

    float outLine = step(0.0, 1.0-length(data.xyz)) * data.w;

    gl_FragColor = vec4(vec3(vUv, outLine) * outLine, 1.0);
}
