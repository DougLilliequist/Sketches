#version 300 es
precision highp float;

uniform sampler2D tDepth;

in vec3 vNormal;
in vec3 vLocalNormal;
in vec2 vUv;
in vec3 vPos;
in vec3 vEyePos;
in vec3 vLight;

in vec4 vClipPos;

uniform vec3 cameraPosition;

out vec4 FragColor[2];

float wrapLight(float light) {
    return light * (1.0 - 0.5) + 0.5;
}

void main() {

    vec3 lightCol = vec3(0.93, 1, 0.97);

//    vec3 lightPos = vec3(0.0, 3.0, 5.5);
//    float light = dot(normalize(lightPos), vNormal)*0.5+0.5;
//
//    vec3 lightDir = normalize(lightPos - vEyePos);
//    vec3 e = -vEyePos;
//    vec3 r = reflect(-lightDir, vNormal);
//
//    float spec = pow(clamp(dot(lightDir, r), 0.0, 1.0), 8.0);
//
//    vec2 clipUv = (vClipPos.xy / vClipPos.w) * 0.5 + 0.5;
//    float depth = texture2D(tDepth, clipUv + vNormal.xy * 0.025).x;
//    float rimLight = clamp(gl_FragCoord.z - depth, 0.0, 1.0) * 40.0;


    float fresnel = pow(1.0 - clamp(dot(normalize(-vEyePos), vNormal), 0.0, 1.0), 2.0);
    vec3 diffuse = vec3(0.68, 1.0, 0.78);
    FragColor[0] = vec4(diffuse * 0.85 + (fresnel * lightCol * 0.15), 1.0);
    FragColor[1] = vec4(normalize(vNormal), 1.0);
//    gl_FragColor = vec4(vec3(rimLight) * vec3(0.0, 0.0, 1.0), 1.0);
}
