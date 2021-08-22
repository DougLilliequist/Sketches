precision highp float;

varying vec3 vNormal;

void main() {

    gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
//    gl_FragColor = vec4(vec3(1.0, 0.5, 0.12), 1.0);

}