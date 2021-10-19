    precision highp float;

    uniform sampler2D _Normal;
    varying vec2 vUv;
    varying float vLife;

    vec4 packRGBA (float v) {
        vec4 pack = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * v);
        pack -= pack.yzww * vec2(1.0 / 255.0, 0.0).xxxy;
        return pack;
    }

    void main() {

        // float normal = texture2D(_Normal, vUv).x;
        // if(normal <= 0.0) discard;
        vec2 uv = 2.0 * vUv - 1.0;
        if(dot(uv, uv) > 1.0) discard;
        vec4 depth = packRGBA(gl_FragCoord.z);

        gl_FragColor = depth;
    }