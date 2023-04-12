precision mediump float;
void main() {
    vec3 col = vec3(0.0);
    if(int(gl_FragCoord.x) == 0 && int(gl_FragCoord.y) == 0) col = vec3(0.0, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
}
