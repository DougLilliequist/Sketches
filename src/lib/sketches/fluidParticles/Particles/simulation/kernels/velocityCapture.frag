precision highp float;

uniform sampler2D tMap;
uniform sampler2D _Position;
uniform sampler2D _OpticalFlow;

uniform mat4 _TextureProjectionMatrix;
uniform float _Aspect;

varying vec2 vUv;

void main() {

    vec4 pos = texture2D(_Position, vUv);
    vec3 currentCapturedVel = texture2D(tMap, vUv).xyz;
    float life = pos.w;
    
    //if particle is recently spawned: get the color at the spawned location
    if(life >= 1.0) {

        vec4 clipPos = _TextureProjectionMatrix * vec4(pos.xyz, 1.0);
        clipPos /= clipPos.w;
        clipPos.xy = clipPos.xy * 0.5 + 0.5;

        //clip position is a uniform square. aspect correct so each particle position
        //is correctly sampling the flow map texture as if the screens aspect ratio is that
        //of the textures resolution
        clipPos -= 0.5;
        clipPos.y /= _Aspect;
        clipPos += 0.5;

        currentCapturedVel = texture2D(_OpticalFlow, clipPos.xy).xyz;

    }

    gl_FragColor = vec4(currentCapturedVel, 1.0);

}