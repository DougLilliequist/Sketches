precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute float frustumCornerIndex;

uniform mat4 _MainCameraViewMatrix;
uniform mat4 _MainCameraInvViewMatrix;
uniform vec3 _CameraWorldPos;

uniform vec3 _FrustumCorners[4];

uniform float _Far;
uniform vec2 _FrustumParams;

varying vec3 vViewRay;
varying vec2 vUv;

#define USING_WORLDPSPACE_POSITION

void main() {

    gl_Position = vec4(position, 1.0);

    #ifdef USING_WORLDPSPACE_POSITION
    vViewRay = mat3(_MainCameraInvViewMatrix) * vec3((uv * 2.0 - 1.0) * _FrustumParams, -_Far);
    #else
    vViewRay = vec3(0.0);
    #endif
    vUv = uv;
}

