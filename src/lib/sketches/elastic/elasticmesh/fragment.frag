#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vPos;
in vec2 vUv;

out vec4 FragColor;

void main() {

    vec3 lightPos = vec3(0.0, 10.0, 3.0);
    vec3 lightDir = normalize(lightPos - vPos);

    float light = dot(lightDir, vNormal) * 0.5 + 0.5;
    light = light * light;

    FragColor = vec4(vNormal*0.5+0.5, 1.0);
}
