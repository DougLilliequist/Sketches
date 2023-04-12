import {Vec2} from 'ogl';
import {RenderTarget} from 'ogl';
import {Mesh} from 'ogl';
import {Program} from 'ogl';
import {Triangle} from 'ogl';
import {Texture} from 'ogl';

import screenQuad from '../screenQuad.vert?raw'
import blur_downsample from './blur_downsample.frag?raw'
import blur_upsample from './blur_upsample.frag?raw'


export default class DualFilterBlurPass {

    constructor(gl, {
        width = 2,
        height = 2,
        stepCount = 1
    }) {

        this.gl = gl;
        this.stepCount = stepCount * 2; //one down, one up

        this.setSize({width, height});
        this.initBlurPasses();

    }

    initBlurPasses() {

        this.createBlurBuffers();

        const uniforms = {

            tDiffuse: {
                value: new Texture(this.gl)
            },
            uStepSize: {
                value: 1
            },
            uTime: {
                value: 0
            },
            uResolution: {
                value: new Vec2(this.width, this.height)
            },
            uScale: {
                value: 1.0
            },
            uSeed: {
                value: 0
            }
        }

        this.downsamplePass = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                vertex: screenQuad,
                fragment: blur_downsample,
                uniforms,
                transparent: false,
                depthTest: false,
                depthWrite: false,
                cullFace: null
            })
        });

        this.upsamplePass = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                vertex: screenQuad,
                fragment: blur_upsample,
                uniforms,
                transparent: false,
                depthTest: false,
                depthWrite: false,
                cullFace: null
            })
        });

    }

    render({pass, time}) {

        for (let i = 0; i < this.blurBuffers.length - 1; i++) {

            this.downsamplePass.program.uniforms.tDiffuse.value = i > 0 ? this.blurBuffers[i].buffer.texture : pass.texture;
            this.downsamplePass.program.uniforms.uResolution.value.copy(this.blurBuffers[i].resolution);
            this.gl.renderer.render({scene: this.downsamplePass, target: this.blurBuffers[i + 1].buffer, clear: false});
        }

        for (let i = this.blurBuffers.length - 1; i > 0; i--) {

            this.upsamplePass.program.uniforms.tDiffuse.value = this.blurBuffers[i].buffer.texture;
            this.upsamplePass.program.uniforms.uResolution.value.copy(this.blurBuffers[i].resolution);
            this.gl.renderer.render({scene: this.upsamplePass, target: this.blurBuffers[i - 1].buffer, clear: false});

        }

    }

    createBlurBuffers() {

        this.blurBuffers = new Array(this.stepCount);

        let scale = 1.0;
        for (let i = 0; i < this.blurBuffers.length; i++) {

            const textureParams = {
                width: this.width * scale,
                height: this.height * scale,
                minFilter: this.gl.LINEAR,
                magFilter: this.gl.LINEAR,
                format: this.gl.RGB,
                internalFormat: this.gl.RGB,
            }

            this.blurBuffers[i] = {
                buffer: new RenderTarget(this.gl, textureParams),
                resolution: new Vec2(textureParams.width, textureParams.height)
            }
            scale *= 0.5;
        }

    }

    onResize({width, height}) {
        this.setSize({width, height});

        this.createBlurBuffers()
    }

    setSize({width, height}) {
        this.width = width === null ? this.gl.canvas.width : width
        this.height = height === null ? this.gl.canvas.height : height
    }

    get Output() {
        return this.blurBuffers[0].buffer.texture;
    }

}
