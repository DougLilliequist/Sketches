precision highp float;

uniform sampler2D tPrev;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

vec3 sinNoise(vec3 seed, float fallOff, int octaves) {

    vec3 noise = vec3(0.0);

    float amp = 1.0;
    float freq = 1.0;

    vec3 s = seed;

    mat3 mat = mat3(0.563152, 0.495996, 0.660945, -0.660945, 0.750435, 0.0, -0.495996, -0.436848, 0.750435);

    for(int i = 0; i < 8; i++) {
        s = mat * s.yzx;
        noise += sin(s.yzx * freq) * amp;
        amp *= fallOff;
        freq /= fallOff;
        s += noise;

    }

    return noise;
}

float wolfram(float a, float b, float c) {
    if(a > 0.5 && b > 0.5 && c > 0.5) return 0.0;
    if(a > 0.5 && b > 0.5 && c <= 0.0) return 0.0;
    if(a > 0.5 && b <= 0.0 && c > 0.5) return 0.0;
    if(a > 0.5 && b <= 0.0 && c <= 0.0) return 1.0;
    if(a <= 0.0 && b > 0.5 && c > 0.5) return 1.0;
    if(a <= 0.0 && b > 0.5 && c <= 0.0) return 1.0;
    if(a <= 0.0 && b <= 0.0 && c > 0.5) return 1.0;
    if(a <= 0.0 && b <= 0.0 && c <= 0.0) return 0.0;
    return 0.0;
}

void main() {

    vec2 tSize = 1.0 / uResolution;
    vec2 uv = vUv;

    vec3 noise = sinNoise(vec3(uv-0.5, uTime), .737, 4);

    float totalLife = 0.0;

    //loop over neighbourhood and count the total amount of life
    for(float y = -1.0; y <= 1.0; y++) {
        for(float x = -1.0; x <= 1.0; x++) {
            if(x == 0.0 && y == 0.0) continue;
            vec2 c = uv + vec2(x, y) * tSize;
            totalLife += texture2D(tPrev, c).x;
        }
    }

//    uv += noise.xy * 0.001;
    float cellLife = texture2D(tPrev, uv).x;
    bool isAlive = cellLife > 0.0;

//    if((isAlive && (totalLife >= 2.0 && totalLife <= 3.0)) || (!isAlive && totalLife == 3.0)) {
//        cellLife = 1.0;
//    } else {
//        cellLife = 0.0;
//    }

    //interesting
//    if(isAlive && totalLife < 3.0) {
//        cellLife = 0.0;
//    } else if (isAlive && totalLife > 5.0) {
//        cellLife = 0.0;
//    } else if(!isAlive && totalLife == 3.0) {
//        cellLife = 1.0;
//    }

//    //Any live cell with fewer than two live neighbors dies, as if by underpopulation.
    if(isAlive && totalLife < 2.0) {
        cellLife = 0.0;
    //Any live cell with two or three live neighbors lives on to the next generation.
    } else if(isAlive && totalLife >= 2.0 && totalLife <= 3.0) {
        cellLife = 1.0;
    //Any live cell with more than three live neighbors dies, as if by overpopulation.
    } else if(isAlive && totalLife > 3.0) {
        cellLife = 0.0;
    //Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
    } else if(!isAlive && totalLife == 3.0) {
        cellLife = 1.0;
    }

//    vec2 u = vUv;
//    float a = texture2D(tPrev, u + vec2(-tSize.x, 0.0)).x;
//    float b = texture2D(tPrev, u).x;
//    float c = texture2D(tPrev, u + vec2(tSize.x, 0.0)).x;
//    float wolf = wolfram(a, b, c);

    gl_FragColor = vec4(vec3(cellLife), 1.0);
//    gl_FragColor = vec4(vec3(wolf), 1.0);

}
