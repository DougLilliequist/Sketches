#version 300 es
precision highp float;

uniform sampler2D tPosition;
uniform sampler2D tNormal;
uniform sampler2D tPickedRestLengths;

uniform vec3 uHitPoint;
uniform float uDeltaTime;
uniform float uIsDragging;
uniform float uPickedIndex;

in vec2 vUv;
out vec4 FragColor;

void main() {

    ivec2 iCoord = ivec2(gl_FragCoord.xy);

    vec4 pos = texelFetch(tPosition, iCoord, 0);
    vec3 normal = texelFetch(tNormal, iCoord, 0).xyz;

    // float compliance = 0.1/ (uDeltaTime + uDeltaTime);
    float compliance = 0.01/ (uDeltaTime + uDeltaTime);
    if(uIsDragging > 0.5 && uPickedIndex > -1.0) {
        float pickedRestLen = texelFetch(tPickedRestLengths, iCoord, 0).x;
        vec3 dir = uHitPoint - pos.xyz;
        float dist = length(dir);
        if(dist > pickedRestLen) {
            dir /= dist;
            float d = (clamp(dot(dir, normal), 0.0, 1.0) + clamp(dot(dir, -normal), 0.0, 1.0));
            float mass = mix(2.0, 1.0, smoothstep(0.29, 3.0, exp(-pickedRestLen * pickedRestLen)));
            float k = smoothstep(0.1, 0.0, pickedRestLen);
            // pos.xyz += dir * (dist - pickedRestLen) * k * mix(0.1, 1.0, d) * 0.05;
            pos.xyz += dir * (dist - pickedRestLen) * k * 0.05;
        }

    }

    FragColor = pos;

}
