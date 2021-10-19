precision highp float;

uniform sampler2D tMap;
uniform sampler2D _Position;
uniform sampler2D _OpticalFlow;
uniform sampler2D _InputImg;

uniform mat4 _TextureProjectionMatrix;
uniform vec2 _Resolution;

varying vec2 vUv;

void main() {

    vec4 pos = texture2D(_Position, vUv);
    vec3 currentCol = texture2D(tMap, vUv).xyz;
    float life = pos.w;
    
    //if particle is recently spawned: get the color at the spawned location
    if(life >= 1.0) {

        vec4 clipPos = _TextureProjectionMatrix * vec4(pos.xyz, 1.0);
        clipPos.xy = clipPos.xy * 0.5 + 0.5;

        float aspect = (_Resolution.x / _Resolution.y) / (640.0/480.0);
        clipPos -= 0.5;
        clipPos.y /= aspect;
        clipPos += 0.5;

        currentCol = texture2D(_InputImg, clipPos.xy).xyz;

    }

    gl_FragColor = vec4(currentCol, 1.0);

}