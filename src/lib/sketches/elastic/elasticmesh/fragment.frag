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
    vec3 normal = normalize(vNormal);

    if(!gl_FrontFacing) normal = -normal;

    uv.y = 1.0 - uv.y;
    vec3 col = texture(tMap, uv).xyz;
    vec3 lightPos = vec3(0.0, 10.0, 8.0);
    vec3 lightDir = normalize(lightPos - vPos);
    vec3 eyeDir = normalize(cameraPosition - vPos);
    vec3 halfDir = normalize(eyeDir + lightDir);

    float diff = dot(lightDir, normal) * 0.5 + 0.5;
    float spec = max(0.0, pow(dot(halfDir, normal), 128.0));

    float ambientLight = normal.y * 0.5 + 0.5;
    float fresnel = pow(1.0 - max(0.0, dot(normalize(-vViewPos), normal)), 2.0);
    float totalLight = diff * 0.1 + spec * 0.2 + fresnel * 0.1 + ambientLight * 0.6;

    FragColor = vec4(normal*0.5+0.5, 1.0);
    FragColor = vec4(vec3(totalLight), 1.0);
//    FragColor = vec4(vec3(light), 1.0);
}
