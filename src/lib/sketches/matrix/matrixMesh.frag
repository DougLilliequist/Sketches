precision highp float;

uniform sampler2D tDepth;

varying vec3 vNormal;
varying vec3 vLocalNormal;
varying vec2 vUv;
varying vec3 vPos;
varying vec3 vEyePos;
varying vec3 vLight;

varying vec4 vClipPos;

uniform vec3 cameraPosition;

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
    gl_FragColor = vec4(diffuse * 0.85 + (fresnel * lightCol * 0.15), 1.0);
//    gl_FragColor = vec4(vec3(rimLight) * vec3(0.0, 0.0, 1.0), 1.0);
}
