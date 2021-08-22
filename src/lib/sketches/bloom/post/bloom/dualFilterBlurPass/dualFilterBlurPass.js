import {Vec2} from 'ogl';
import {RenderTarget} from 'ogl';
import {Mesh} from 'ogl';
import {Program} from 'ogl';
import {Triangle} from 'ogl';
import {Texture} from 'ogl';

import vertex from './shader/vertex.vert?raw'
import blur_downsample from './shader/blur_downsample.frag?raw'
import blur_upsample from './shader/blur_upsample.frag?raw'


export default class DualFilterBlurPass {

    constructor(gl, {
        width,
        height,
    }) {

        this.gl = gl;

        this.resolutionScale = 0.5;

        this.setSize({width, height});
        this.initBlurPasses();

    }

    initBlurPasses() {

        this.createBlurBuffers();

        const uniforms = {

            _Image: {
                value: new Texture(this.gl)
            },
            _StepSize: {
                value: 1
            },
            _Time: {
                value: 0
            },
            _Resolution: {
                value: new Vec2(Math.floor(this.width * this.resolutionScale), Math.floor(this.height * this.resolutionScale))
            },
            _Seed: {
                value: 0
            }
        }

        this.downsamplePass = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                vertex,
                fragment: blur_downsample,
                uniforms,
                transparent: false,
                depthTest: false,
                depthWrite: false
            })
        });

        this.upsamplePass = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                vertex,
                fragment: blur_upsample,
                uniforms,
                transparent: false,
                depthTest: false,
                depthWrite: false
            })
        });

    }

    render({pass, time}) {

        for (let i = 0; i < this.blurBuffers.length-1; i++) {

            if(i === 0) {
                this.downsamplePass.program.uniforms._Image.value = pass.texture;
                this.downsamplePass.program.uniforms._Resolution.value.set(pass.width, pass.height);
            } else {
                this.downsamplePass.program.uniforms._Image.value = this.blurBuffers[i].buffer.texture;
                this.downsamplePass.program.uniforms._Resolution.value.copy(this.blurBuffers[i].resolution);
            }
            this.downsamplePass.program.uniforms._Seed.value = i * 100.0 * Math.random();
            this.downsamplePass.program.uniforms._Time.value = time;

            this.gl.renderer.render({scene: this.downsamplePass, target: this.blurBuffers[i+1].buffer, clear: false});
        }

        for (let i = this.blurBuffers.length-1; i > 0; i--) {

            this.upsamplePass.program.uniforms._Image.value = this.blurBuffers[i].buffer.texture;
            this.upsamplePass.program.uniforms._Resolution.value.copy(this.blurBuffers[i].resolution);
            this.upsamplePass.program.uniforms._Time.value = time;
            this.upsamplePass.program.uniforms._Seed.value = i * 100.0 * Math.random();

            this.gl.renderer.render({scene: this.upsamplePass, target: this.blurBuffers[i-1].buffer, clear: false});

        }

    }

    createBlurBuffers() {

        const bufferCount = 4;

        this.blurBuffers = new Array(bufferCount);

        let scale = 1.0;
        for (let i = 0; i < this.blurBuffers.length; i++) {

            const textureParams = {
                width: Math.floor(this.width * this.resolutionScale * scale),
                height: Math.floor(this.height * this.resolutionScale * scale),
                minFilter: this.gl.LINEAR,
                magFilter: this.gl.LINEAR,
                format: this.gl.RGB,
                internalFormat: this.gl.RGB,
                depth: false
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