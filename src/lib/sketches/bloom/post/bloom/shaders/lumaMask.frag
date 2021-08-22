precision highp float;

uniform sampler2D _ColorPass;

uniform float _BrightnessThreshold;
uniform float _SmoothWidth;
uniform float _Intensity;

varying vec2 vUv;

#define CLEARCOL vec3(0.0, 0.0, 0.0)

float luma(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

float luma(vec4 color) {
    return dot(color.xyz, vec3(0.299, 0.587, 0.114));
}

//remix of following implementation:
//https://github.com/mrdoob/three.js/blob/342946c8392639028da439b6dc0597e58209c696/examples/js/shaders/LuminosityHighPassShader.js
void main() {

    vec4 col = texture2D(_ColorPass, vUv).xyzw;
    col.xyz = mix(vec3(0.0), col.xyz, col.w);

//    float lumaLevel = luma(col);
//    float alpha = smoothstep( _BrightnessThreshold, _BrightnessThreshold + _SmoothWidth, lumaLevel );
//    vec3 mask = mix(CLEARCOL, col, alpha);

    gl_FragColor = vec4(col.xyz, 1.0);

}