precision mediump float;

uniform sampler2D tMap;
uniform float uStep;
uniform float uStepSize;
uniform vec2 uTextureResolution;

varying vec2 vUv;

void main() {

    vec3 col = vec3(0.0);
    vec2 stp = ((uTextureResolution * uStepSize)+0.0) / uTextureResolution;

    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {

            vec2 offset = vec2(float(x), float(y)) * stp;
            vec3 data = texture2D(tMap, ((gl_FragCoord.xy+0.0) / uTextureResolution) + offset).xyz;

            if(data.z > 0.0) col = data;

        }
    }

    gl_FragColor = vec4(col, 1.0);
}
