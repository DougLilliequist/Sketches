precision highp float;

uniform sampler2D _Normal;
uniform vec3 _Light;
uniform mat3 normalMatrix;
uniform mat4 modelMatrix;

varying vec2 vUv;
varying vec3 vNormal;
varying float vLife;
varying float vShadow;
varying vec3 vWorldPos;
varying vec3 vEyeDir;

void main() {

    vec3 normal = texture2D(_Normal, vUv).xyz;
    vec2 c = 2.0 * vUv - 1.0;
    if(dot(c,c) > 0.8) discard;
    normal = normalize((normal * 2.0 - 1.0));
    vec3 viewNormal = normalize(vWorldPos + (normal * normalMatrix));
    vec3 worldNormal = normalize(vWorldPos + normal);
    vec3 lightP = normalize(_Light);
    float nDotL = dot(viewNormal, lightP);
    float light = nDotL * 0.5 + (1.0 - 0.5);
//    light = light * light;
    float fresnel = pow(1.0-(clamp(dot(normalize(vEyeDir), normal), 0.0, 1.0)), 2.0);
    float ambient = worldNormal.y * 0.5 + 0.5;

    vec3 col = vec3(0.61, 0.8, 0.91);
    col = mix(mix(col + vec3(0.3, 0.0, 0.0), col + vec3(0.0, 0.0, 0.09), vLife), col, vLife); //subtle doppler effect
    col *= (light * 0.9) + (fresnel * 0.1) + ambient;
    col = clamp(col, 0.0, 1.0);
    col *= mix(0.7, 1.0, vShadow);

    gl_FragColor = vec4(col, 1.0);

}

//precision highp float;
//
//uniform sampler2D _Normal;
//uniform vec3 _Light;
//
//varying vec2 vUv;
//varying vec3 vNormal;
//varying float vLife;
//varying float vShadow;
//
//void main() {
//
//    vec3 normal = texture2D(_Normal, vUv).xyz;
//    vec2 c = 2.0 * vUv - 1.0;
//    if(dot(c,c) > 0.8) discard;
//    normal = normal * 2.0 - 1.0;
//
//    float light = dot(normal, _Light) * 0.5 + 0.5;
//
//    vec3 col = vec3(0.61, 0.8, 0.98);
//    col = mix(mix(col + vec3(0.3, 0.0, 0.0), col + vec3(0.0, 0.0, 0.8), vLife), col, vLife); //subtle doppler effect
//    col *= light * 2.0;
//    col *= mix(0.6, 1.0, vShadow);
//
//    gl_FragColor = vec4(col, 1.0);
//
//}

