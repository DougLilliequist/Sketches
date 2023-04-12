#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tPosition;
uniform sampler2D tNormal;

uniform float uTextureSize;

uniform vec3 uBoundsMin;
uniform vec3 uBoundsMax;
uniform vec3 uInputPos;
uniform vec3 uHitPoint;
uniform float uApplyInput;

uniform vec3 uLightColor;

#!VARYINGS
varying vec3 vNormal;
varying vec3 vPos;
varying vec2 vUv;
varying vec3 vViewPos;

#!SHADER: Vertex
#require(range.glsl)
#require(pbr.vs)
void main() {

    float index = float(gl_VertexID);
    float posX = mod(index, uTextureSize) + 0.5;
    float posY = floor(index / uTextureSize) + 0.5;
    vec2 coord = vec2(posX, posY)/ uTextureSize;

    vec3 localPos = texture2D(tPosition, coord).xyz;
    setupPBR(localPos);

    vec3 norm = texture2D(tNormal, coord).xyz;

    vPos = localPos;
    vNormal = normalMatrix * norm;
    vUv = uv;

    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);
    vViewPos = viewPos.xyz;

    gl_Position = projectionMatrix * viewPos;
}

    #!SHADER: Fragment
    #require(pbr.fs)

void main() {

    // PBR Config
    // this is the default config that can be tweaked
    PBRConfig baseConfig;
    baseConfig.clearcoat = 0.0;
    baseConfig.reflection = 1.0;
    baseConfig.color = vec3(1.0);
    baseConfig.lightColor = uLightColor;

    vec4 baseColor = texture2D(tBaseColor, vUv);
    vec3 pbr = getPBR(baseColor.rgb, baseConfig).rgb;

    float diff = dot(normalize(vec3(0.0, 4.0, 0.0) - vPos), vNormal) * 0.25 + (1.0 - 0.25);
    float ambient = vNormal.y * 0.5 + 0.5;

    vec3 E = cameraPosition - vPos;
    vec3 L = vec3(0.0, 4.0, 0.0) + vNormal * 3.8;
    vec3 eyeDir = normalize(E);
    vec3 lightDir = normalize(L - vPos);
    vec3 R = normalize(reflect(-L, vNormal));

    float spec = pow(max(0.0, dot(R, eyeDir)), 16.0);
    float light = diff * 0.6 + spec * 0.1 + ambient * 0.3;


    gl_FragColor = vec4(baseColor.xyz * light, 1.0);
//    gl_FragColor = vec4(vec3(light), 1.0);
}
