precision highp float;

varying vec3 vNormal;
//varying vec3 vFaceNormal;

void main() {
    gl_FragColor = vec4(vNormal*0.5+0.5, 1.0);
}
