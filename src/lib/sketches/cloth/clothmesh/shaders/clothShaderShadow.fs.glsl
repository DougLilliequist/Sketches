#version 300 es
precision highp float;

vec4 packRGBA (float v) {
    vec4 pack = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * v);
    pack -= pack.yzww * vec2(1.0 / 255.0, 0.0).xxxy;
    return pack;
}

out vec4 FragColor;

void main() {
    vec4 depth = packRGBA(gl_FragCoord.z);
    FragColor = depth;
}
