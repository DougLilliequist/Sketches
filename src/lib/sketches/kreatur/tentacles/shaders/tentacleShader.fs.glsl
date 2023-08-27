precision highp float;

uniform vec3 cameraPosition;

varying vec3 vPos;
varying vec3 vEyeDir;
varying vec3 vNormal;
varying vec2 vUv;

void main() {

    vec3 eye = normalize(cameraPosition - vPos);
    vec3 light = vec3(0.0, 10.0, 0.0);
    vec3 lightDir = normalize(light - vPos);
    vec3 halfV = normalize(lightDir + eye);

    float halfLambert = dot(lightDir, vNormal) * 0.5 + 0.5;
    float spec = pow(max(0.0, dot(halfV, vNormal)), 42.0);

    gl_FragColor = vec4(vec3(halfLambert * 0.05 + spec * 0.95), 1.0);
    gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);

}
