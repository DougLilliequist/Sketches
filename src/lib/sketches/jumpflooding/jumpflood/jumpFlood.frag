precision mediump float;

uniform sampler2D tMap;
uniform float uStep;
uniform float uStepSize;
uniform vec2 uTextureResolution;

varying vec2 vUv;

void main() {

    vec3 bestCoord = vec3(0.0);
    vec2 stp = (uTextureResolution * uStepSize) / uTextureResolution;

        float bestDist = 10000.0;
        for(int y = -1; y <= 1; y++) {
            for(int x = -1; x <= 1; x++) {

                vec2 offset = vec2(float(x), float(y)) * stp;
                vec2 coord = vUv + offset;
                vec3 data = texture2D(tMap, coord).xyz;

                vec2 dir = data.xy - vUv;
//                float dist = length(dir);
                float dist = dot(dir, dir);
                if((data.z > 0.0) && (dist < bestDist)) {
                    bestDist = dist;
                    bestCoord.xy = data.xy;
                    bestCoord.z = data.z;
                }
            }
        }

    gl_FragColor = vec4(bestCoord, 1.0);
}
