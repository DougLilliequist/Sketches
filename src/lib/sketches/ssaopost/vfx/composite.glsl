#version 300 es
precision highp float;

uniform sampler2D tMap;
uniform sampler2D tSSAO;

in vec2 vUv;
in vec3 vNormal;
out vec4 FragColor;

void main() {

    vec3 col = texture(tMap, vUv).xyz;
    vec3 ssao = texture(tSSAO, vUv).xyz;

    vec3 outputCol = mix(col * ssao.x, col, step(vUv.x, 0.5));

    FragColor = vec4(col * ssao.x, 1.0);

}
