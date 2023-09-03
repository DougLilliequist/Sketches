precision highp float;

uniform sampler2D tMap;
uniform vec2 uTexelSize;

varying vec2 vUv;

void main() {

    float x = uTexelSize.x;
    float y = uTexelSize.y;

    vec3 downSample = vec3(0.0);

    vec3 a = texture2D(tMap, vec2(vUv.x - 2.0*x, vUv.y + 2.0*y)).rgb;
    vec3 b = texture2D(tMap, vec2(vUv.x,       vUv.y + 2.0*y)).rgb;
    vec3 c = texture2D(tMap, vec2(vUv.x + 2.0*x, vUv.y + 2.0*y)).rgb;

    vec3 d = texture2D(tMap, vec2(vUv.x - 2.0*x, vUv.y)).rgb;
    vec3 e = texture2D(tMap, vec2(vUv.x,       vUv.y)).rgb;
    vec3 f = texture2D(tMap, vec2(vUv.x + 2.0*x, vUv.y)).rgb;

    vec3 g = texture2D(tMap, vec2(vUv.x - 2.0*x, vUv.y - 2.0*y)).rgb;
    vec3 h = texture2D(tMap, vec2(vUv.x,       vUv.y - 2.0*y)).rgb;
    vec3 i = texture2D(tMap, vec2(vUv.x + 2.0*x, vUv.y - 2.0*y)).rgb;

    vec3 j = texture2D(tMap, vec2(vUv.x - x, vUv.y + y)).rgb;
    vec3 k = texture2D(tMap, vec2(vUv.x + x, vUv.y + y)).rgb;
    vec3 l = texture2D(tMap, vec2(vUv.x - x, vUv.y - y)).rgb;
    vec3 m = texture2D(tMap, vec2(vUv.x + x, vUv.y - y)).rgb;

    // Apply weighted distribution:
    // 0.5 + 0.125 + 0.125 + 0.125 + 0.125 = 1
    // a,b,d,e * 0.125
    // b,c,e,f * 0.125
    // d,e,g,h * 0.125
    // e,f,h,i * 0.125
    // j,k,l,m * 0.5
    // This shows 5 square areas that are being sampled. But some of them overlap,
    // so to have an energy preserving downsample we need to make some adjustments.
    // The weights are the distributed, so that the sum of j,k,l,m (e.g.)
    // contribute 0.5 to the final color output. The code below is written
    // to effectively yield this sum. We get:
    // 0.125*5 + 0.03125*4 + 0.0625*4 = 1
    downSample = e*0.125;
    downSample += (a+c+g+i)*0.03125;
    downSample += (b+d+f+h)*0.0625;
    downSample += (j+k+l+m)*0.125;

    gl_FragColor = vec4(downSample, 1.0);

}
