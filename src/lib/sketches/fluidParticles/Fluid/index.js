import {
    Program, Triangle
} from 'ogl';
import {
    Texture
} from 'ogl';
import {
    Mesh
} from 'ogl';
import {
    RenderTarget
} from 'ogl';
import {
    Vec2
} from 'ogl';
import {
    Vec3
} from 'ogl';
import {
    Geometry
} from 'ogl';

import base from './shaders/baseVertex.vert?raw';
import advectionShader from './shaders/advection.frag?raw';
import advectionManualFilterShader from './shaders/advectionManualFiltering.frag?raw';
import clearShader from './shaders/clear.frag?raw';
import curlShader from './shaders/curl.frag?raw';
import divergenceShader from './shaders/divergence.frag?raw';
import gradientSubtractShader from './shaders/gradientSubtract.frag?raw';
import pressureShader from './shaders/pressure.frag?raw';
import splatShader from './shaders/splat.frag?raw';
import vorticityShader from './shaders/vorticity.frag?raw';
import VelocityFieldShader from './shaders/velocityField.frag?raw';

/**
 * Based on OGL post fluid example: https://github.com/oframe/ogl/blob/master/examples/post-fluid-distortion.html by Nathan Gordon
 */

export default class Fluid {

    constructor(gl) {

        this.gl = gl;

        this.initSimParams();
        this.initSimulationPrograms();

    }

    initSimParams() {

        this.simRes = 128.0;
        this.dyeRes = 512.0;
        this.splats = [];

        this.force = 0;
        this.texelSize = new Vec2(1.0 / this.simRes);

        this.simParams = {

            iterations: 6,
            densityDissipation: 0.97,
            velocityDissipation: 1.0,
            pressureDissipation: 0.97,
            curlStrength: .5,
            // radius: 0.1
            radius: 0.2

        }

    }

    initSimulationPrograms() {

        // Get supported formats and types for FBOs
        let supportLinearFiltering = this.gl.renderer.extensions[`OES_texture_${this.gl.renderer.isWebgl2 ? `` : `half_`}float_linear`];
        const halfFloat = this.gl.renderer.isWebgl2 ? this.gl.FLOAT : this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;
        const filtering = supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST;

        let rgba, rg, r;

        if (this.gl.renderer.isWebgl2) {
            rgba = this.getSupportedFormat(this.gl, this.gl.RGBA16F, this.gl.RGBA, halfFloat);
            rg = this.getSupportedFormat(this.gl, this.gl.RG16F, this.gl.RG, halfFloat);
            r = this.getSupportedFormat(this.gl, this.gl.R16F, this.gl.RED, halfFloat);

        } else {
            rgba = this.getSupportedFormat(this.gl, this.gl.RGBA, this.gl.RGBA, halfFloat);
            rg = rgba;
            r = rgba;
        }

        this.densityFBO = this.createPingPongBuffer({
            width: this.dyeRes,
            height: this.dyeRes,
            type: halfFloat,
            format: rgba?.format,
            internalFormat: rgba?.internalFormat,
            minFilter: filtering,
            depth: false
        });

        this.velocityFBO = this.createPingPongBuffer({
            width: this.simRes,
            height: this.simRes,
            type: halfFloat,
            format: rg?.format,
            internalFormat: rg?.internalFormat,
            minFilter: filtering,
            depth: false
        });

        this.pressureFBO = this.createPingPongBuffer({
            width: this.simRes,
            height: this.simRes,
            type: halfFloat,
            format: r?.format,
            internalFormat: r?.internalFormat,
            minFilter: this.gl.NEAREST,
            depth: false
        });

        this.divergence = new RenderTarget(this.gl, {
            width: this.simRes,
            height: this.simRes,
            type: halfFloat,
            format: r?.format,
            internalFormat: r?.internalFormat,
            minFilter: this.gl.NEAREST,
            depth: false
        });

        this.curl = new RenderTarget(this.gl, {
            width: this.simRes,
            height: this.simRes,
            type: halfFloat,
            format: r?.format,
            internalFormat: r?.internalFormat,
            minFilter: this.gl.NEAREST,
            depth: false
        });

        this.velocityFieldTarget = new RenderTarget(this.gl, {
            width: this.simRes,
            height: this.simRes,
            type: halfFloat,
            format: rgba?.format,
            internalFormat: rgba?.internalFormat,
            minFilter: filtering,
            depth: false
        });

        this.velocityFieldFBO = this.createPingPongBuffer({
            width: this.dyeRes,
            height: this.dyeRes,
            type: halfFloat,
            format: rgba?.format,
            internalFormat: rgba?.internalFormat,
            minFilter: filtering,
            depth: false
        });

        const triangle = new Geometry(this.gl, {
            position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
            uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
        });

        const clearUniforms = {
            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            uTexture: {
                value: null
            },
            value: {
                value: this.simParams.pressureDissipation
            },
        }

        this.clearProgram = new Mesh(this.gl, {
            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: clearShader,
                uniforms: clearUniforms,
                depthTest: false,
                depthWrite: false
            })
        });

        //for texture input
        const splatUniforms = {
            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            uTarget: {
                value: null
            },
            aspectRatio: {
                value: 1.0
            },
            color: {
                value: new Texture(this.gl)
            },
            point: {
                value: new Vec2()
            },
            radius: {
                value: this.simParams.radius/100.0
            },
            inputVelocity: {
                value: new Vec3(0.0, 0.0, 0.0)
            }
        }

        this.splatProgram = new Mesh(this.gl, {
            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: splatShader,
                uniforms: splatUniforms,
                depthTest: false,
                depthWrite: false
            })
        });

        const advectionUniforms = {
            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            dyeTexelSize: {
                value: new Vec2(1.0 / this.dyeRes, 1.0 / this.dyeRes)
            },
            uVelocity: {
                value: null
            },
            uSource: {
                value: null
            },
            dt: {
                value: 0.016
            },
            dissipation: {
                value: 1.0
            }
        };

        this.advectionProgram = new Mesh(this.gl, {
            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: supportLinearFiltering ? advectionShader : advectionManualFilterShader,
                uniforms: advectionUniforms,
                depthTest: false,
                depthWrite: false
            })
        });

        const divergenceUniforms = {
            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            uVelocity: {
                value: null
            }
        };

        this.divergenceProgram = new Mesh(this.gl, {
            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: divergenceShader,
                uniforms: divergenceUniforms,
                depthTest: false,
                depthWrite: false
            })
        });

        const curlUniforms = {
            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            uVelocity: {
                value: null
            }
        }

        this.curlProgram = new Mesh(this.gl, {
            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: curlShader,
                uniforms: curlUniforms,
                depthTest: false,
                depthWrite: false
            })
        });

        const vorticityUniforms = {

            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            uVelocity: {
                value: null
            },
            uCurl: {
                value: null
            },
            curl: {
                value: this.simParams.curlStrength
            },
            dt: {
                value: 0.016
            }

        }

        this.vorticityProgram = new Mesh(this.gl, {
            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: vorticityShader,
                uniforms: vorticityUniforms,
                depthTest: false,
                depthWrite: false
            })
        });

        const pressureUniforms = {

            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            uPressure: {
                value: null
            },
            uDivergence: {
                value: null
            }

        }

        this.pressureProgram = new Mesh(this.gl, {
            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: pressureShader,
                uniforms: pressureUniforms,
                depthTest: false,
                depthWrite: false
            })
        });

        const gradientSubtractUniforms = {

            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            uPressure: {
                value: null
            },
            uVelocity: {
                value: null
            }

        }

        this.gradientSubtractProgram = new Mesh(this.gl, {

            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: gradientSubtractShader,
                uniforms: gradientSubtractUniforms,
                depthTest: false,
                depthWrite: false
            })

        });

        const velocityFieldUniforms = {
            tMap: {
                value: this.velocityFieldFBO.read.texture
            },
            uSource: {
                value: null
            },
            texelSize: {
                value: new Vec2().copy(this.texelSize)
            },
            dyeTexelSize: {
                value: new Vec2(1.0 / this.dyeRes, 1.0 / this.dyeRes)
            },
            uVelocity: {
                value: new Texture(this.gl)
            },
            dt: {
                value: 0.016
            },
            dissipation: {
                value: 1.0
            }
        };

        this.velocityFieldProgram = new Mesh(this.gl, {
            geometry: triangle,
            program: new Program(this.gl, {
                vertex: base,
                fragment: VelocityFieldShader,
                uniforms: velocityFieldUniforms,
                depthTest: false,
                depthWrite: false
            })
        })

    }

    splat({flowVectorTexture, userInput}) {

        this.splatProgram.program.uniforms.uTarget.value = this.velocityFBO.read.texture;
        this.splatProgram.program.uniforms.aspectRatio.value = this.gl.renderer.width / this.gl.renderer.height;
        this.splatProgram.program.uniforms.color.value = flowVectorTexture;
        this.splatProgram.program.uniforms.point.value.set(userInput.posX, userInput.posY);
        this.splatProgram.program.uniforms.radius.value = this.simParams.radius/100.0

        this.splatProgram.program.uniforms.inputVelocity.value.set(userInput.deltaX, userInput.deltaY, 0.0);


        this.gl.renderer.render({
            scene: this.splatProgram,
            target: this.velocityFBO.write,
            sort: false,
            update: false
        });

        this.velocityFBO.swap();

    }

    update({flowVectorTexture, userInput}) {

        this.gl.renderer.autoClear = false;

        for (let i = this.splats.length - 1; i >= 0; i--) {
            this.splat({flowVectorTexture, userInput: this.splats.splice(i, 1)[0]});
        }

        this.divergenceProgram.program.uniforms.uVelocity.value = this.velocityFBO.read.texture;

        this.gl.renderer.render({
            scene: this.divergenceProgram,
            target: this.divergence,
            sort: false,
            update: false
        });

        this.pressureProgram.program.uniforms.uDivergence.value = this.divergence.texture;

        for (let i = 0; i < this.simParams.iterations; i++) {

            this.pressureProgram.program.uniforms.uPressure.value = this.pressureFBO.read.texture;

            this.gl.renderer.render({
                scene: this.pressureProgram,
                target: this.pressureFBO.write,
                sort: false,
                update: false
            });

            this.pressureFBO.swap();

        }

        this.gradientSubtractProgram.program.uniforms.uPressure.value = this.pressureFBO.read.texture;
        this.gradientSubtractProgram.program.uniforms.uVelocity.value = this.velocityFBO.read.texture;

        this.gl.renderer.render({
            scene: this.gradientSubtractProgram,
            target: this.velocityFBO.write,
            sort: false,
            update: false
        });

        this.velocityFBO.swap();

        this.advectionProgram.program.uniforms.dyeTexelSize.value.set(1 / this.simRes);
        this.advectionProgram.program.uniforms.uVelocity.value = this.velocityFBO.read.texture;
        this.advectionProgram.program.uniforms.uSource.value = this.velocityFBO.read.texture;
        this.advectionProgram.program.uniforms.dissipation.value = this.simParams.velocityDissipation;

        this.gl.renderer.render({
            scene: this.advectionProgram,
            target: this.velocityFBO.write,
            sort: false,
            update: false
        });

        this.velocityFBO.swap();

        this.velocityFieldProgram.program.uniforms.tMap.value = this.velocityFieldFBO.read.texture;
        this.velocityFieldProgram.program.uniforms.texelSize.value.set(1 / this.simRes);
        this.velocityFieldProgram.program.uniforms.uVelocity.value = this.velocityFBO.read.texture;

        this.gl.renderer.render({
            scene: this.velocityFieldProgram,
            target: this.velocityFieldTarget,
            sort: false,
            update: false
        });

        this.gl.renderer.autoClear = true;

    }

    get FluidOutput() {
        return this.velocityFieldTarget.texture;
    }

    createPingPongBuffer({
                             width,
                             height,
                             wrapS,
                             wrapT,
                             minFilter = this.gl.LINEAR,
                             magFilter = minFilter,
                             type,
                             format,
                             internalFormat,
                             depth

                         }) {

        const params = {
            width,
            height,
            wrapS,
            wrapT,
            minFilter,
            magFilter,
            type,
            format,
            internalFormat,
            depth
        };

        const fbo = {

            read: new RenderTarget(this.gl, params),
            write: new RenderTarget(this.gl, params),
            swap: () => {
                let tmp = fbo.read;
                fbo.read = fbo.write;
                fbo.write = tmp;
            }

        }

        return fbo;

    }

    supportRenderTextureFormat(gl, internalFormat, format, type) {

        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status != gl.FRAMEBUFFER_COMPLETE) return false;
        return true;
    }

    // Helper functions for larger device support
    getSupportedFormat(gl, internalFormat, format, type) {
        if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
            switch (internalFormat) {
                case gl.R16F:
                    return this.getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                case gl.RG16F:
                    return this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                default:
                    return null;
            }
        }

        return {
            internalFormat,
            format
        };
    }

}
