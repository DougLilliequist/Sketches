vec2 getCoord(float i, float size) {
    float posX = mod(i, size) + 0.5;
    float posY = floor(i / size) + 0.5;
    return vec2(posX, posY)/ size;
}
