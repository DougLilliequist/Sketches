precision highp float;

uniform sampler2D tDepth;

uniform float uBlurScale;
uniform float uDepthFallOff;
uniform vec2 uBlurDirection;
uniform float uStepSize;
uniform vec2 uTexelSize;

varying vec2 vUv;

//NOTE: this type of blurring is not technically seperable, but you can get away with it in ths case of
//rendering screen space fluids

void main() {

    float depth = texture2D(tDepth, vUv).x;
    float sum = 0.0;
    float weightSum = 0.0;

    sum += texture2D(tDepth, vUv + uTexelSize * uStepSize).x;
    sum += texture2D(tDepth, vUv - uTexelSize * uStepSize).x;
    sum += texture2D(tDepth, vUv + vec2(uTexelSize.x, -uTexelSize.y) * uStepSize).x;
    sum += texture2D(tDepth, vUv + vec2(-uTexelSize.x, uTexelSize.y) * uStepSize).x;

    sum *= 0.25;


//    if(depth * depth > 0.0) {
//        for(float x = -1.5; x <= 1.5; x++ ) {
//
//            //spatial weight using gaussian filter
//            float kernelDist = x * uBlurScale;
//            float spatialWeight = exp(-kernelDist * kernelDist); //exp(-x * x) results in values that incrases as x reaches lower values
//
//            //depth based weight using gaussian filter as well
//            float sampledDepth = texture2D(tDepth, vUv + (uBlurDirection * uTexelSize * x) ).x;
//
//            //because we are negating the exponent of e, a smaller depth falloff will result in a larger depth weight
//            float depthOffset = (sampledDepth - depth) * uDepthFallOff;
//            float depthWeight = exp(-depthOffset * depthOffset);
//
//            float totalWeight = spatialWeight * depthWeight;
//
//            sum += sampledDepth * totalWeight;
//            weightSum += totalWeight;
//
//        }
//
//        if(weightSum > 0.0) sum /= weightSum;
//    }

    gl_FragColor = vec4(sum);
}
