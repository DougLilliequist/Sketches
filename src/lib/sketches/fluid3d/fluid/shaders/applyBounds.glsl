precision highp float;

uniform sampler2D tSource;
uniform float uStep;
uniform float uScale;
uniform float uScalar;

varying vec2 vUv;

void main() {

    if(uScalar > 0.0) {
        float x = texture2D(tSource, vUv).x;
        if(vUv.x < uStep) x *= -1.0;
        if(vUv.x > 1.0 - uStep) x *= -1.0;
        if(vUv.y < uStep) x *= -1.0;
        if(vUv.y > 1.0 - uStep) x *= -1.0;

        gl_FragColor = vec4(vec3(x), 1.0);

    } else {

        vec3 x = texture2D(tSource, vUv).xyz;

        if(vUv.x < uStep) x.x *= -1.0;
        if(vUv.x > 1.0 - uStep) x.x *= -1.0;
        if(vUv.y < uStep) x.y *= -1.0;
        if(vUv.y > 1.0 - uStep) x.y *= -1.0;

//        if(gl_FragCoord.x == 0.0 && gl_FragCoord.y == 0.0) x = (texelFetch(tSource, vec2(1.0, 0)) + texelFetch(tSource, vec2(0, 1.0))) * 0.5;
//        if(gl_FragCoord.x == 255.0 && gl_FragCoord.y == 0.0) x = (texelFetch(tSource, vec2(255.0, 0)) + texelFetch(tSource, vec2(255.0, 1.0))) * 0.5;
//        if(gl_FragCoord.x == 0.0 && gl_FragCoord.y == 0.0) x = (texelFetch(tSource, vec2(0, 0)) + texelFetch(tSource, vec2(0, 0))) * 0.5;
//        if(gl_FragCoord.x == 0.0 && gl_FragCoord.y == 0.0) x = (texelFetch(tSource, vec2(0, 0)) + texelFetch(tSource, vec2(0, 0))) * 0.5;

        gl_FragColor = vec4(x, 1.0);

    }

}
