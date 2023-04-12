#version 300 es
precision highp float;

uniform sampler2D _Normal;
uniform vec3 _Light;

uniform mat4 projectionMatrix;

in vec2 vUv;
in vec3 vNormal;
in float vLife;
in float vShadow;
in vec3 vViewPos;
in vec3 vEyeDir;
in float vSize;
in vec3 vVelocity;

out vec4 fragColor;

void main() {

    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);

//    vec3 normal = vec3(vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y) * 2.0 - 1.0, 0.0);
    vec2 warp = (2.0 * uv - 1.0) + normalize(vVelocity.xy) * 0.1;
    vec2 c = uv;
//    c -= 0.5;
//    c *= 2.0;
//    c += 0.5;

    vec3 normal = texture(_Normal, c + normalize((c * normalize(abs(vVelocity.xy + 0.001))*vVelocity.z * 10.0) + 0.1)*0.1).xyz;
    normal = normal * 2.0 - 1.0;

    //    vec3 normal = texture(_Normal, c).xyz;
//    normal += vVelocity * 10.0;
    float len = dot(normal.xy, normal.xy);
    if(len <= 0.0) discard;
    //    normal.z = sqrt(1.0 - len);
    //calculate impostor depth
    vec4 pixelPos = vec4(vViewPos + normalize(normal)*5.01 , 1.0);
    vec4 clipPos = projectionMatrix * pixelPos;
    float depth = clipPos.z/clipPos.w;
    fragColor = vec4(normal, step(len, 0.0));
    gl_FragDepth = depth;

}

