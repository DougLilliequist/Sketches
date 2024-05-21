#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPos;
in vec3 vViewPos;
in vec2 vUv;

uniform sampler2D tMap;
uniform vec3 cameraPosition;

out vec4 FragColor;

void main() {

    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;
    vec3 col = texture(tMap, uv).xyz;
    vec3 lightPos = vec3(0.0, 10.0, 3.0);
    vec3 lightDir = normalize(lightPos - vPos);

    float light = dot(lightDir, vNormal) * 0.5 + 0.5;
    float ambientLight = vNormal.y * 0.5 + 0.5;
    float fresnel = pow(1.0 - max(0.0, dot(normalize(-vViewPos), vNormal)), 2.0);
    float totalLight = light * 0.5 + fresnel * 0.4 + ambientLight * 0.1;

//    FragColor = vec4(vNormal*0.5+0.5, 1.0);
    FragColor = vec4(totalLight * col, 1.0);
//    FragColor = vec4(vec3(fresnel), 1.0);
}
