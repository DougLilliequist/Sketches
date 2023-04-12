#!ATTRIBUTES
//x: local texture coordinate along x
//y: local texture coordinate along y
//z: vertex ID of bucket element
//w: bucket index;
attribute vec4 data;

#!UNIFORMS
uniform sampler2D tPosition;
uniform sampler2D tCenterOfMass;

uniform float uTextureSize;
uniform float uTileCount;

#!VARYINGS
varying vec3 vPos;
varying float vClusterSize;

#!SHADER: Vertex
#require(getCoord.glsl)

void main() {

    gl_Position = vec4(data.xy * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = 1.0;

    vec3 pos = texture2D(tPosition, data.xy).xyz;

    vec2 tileCoord = getCoord(data.w, uTileCount);
    vec4 centerOfMass = texture2D(tCenterOfMass, tileCoord); //alpha contains the amount of particles in a given cluster
    centerOfMass /= max(1.0, (centerOfMass.w - 1.0));

    vPos = pos - centerOfMass.xyz;
}

    #!SHADER: Fragment
void main() {
    gl_FragColor = vec4(vPos, 1.0);
}
