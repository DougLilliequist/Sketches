import {Vec2} from 'ogl';
import {RenderTarget} from 'ogl';
import {Mesh} from 'ogl';
import {Program} from 'ogl';
import {Triangle} from 'ogl';
import {Texture} from 'ogl';

import vertex from './shader/vertex.vert?raw'
import blur_downsample from './shader/blur_downsample.frag?raw'
import blur_upsample from './shader/blur_upsample.frag?raw'
import capture from './shader/capture.frag?raw';


export default class DualFilterBlurPass {

    constructor(gl, {
        width,
        height,
    }) {

        this.gl = gl;

        this.resolutionScale = 0.5;

        this.setSize({width, height});

        this.initCapturePass();

        this.initBlurPasses();

    }


    initCapturePass() {

        //TODO: create capture pass so I can get the the FXAA at half resolution

        const uniforms = {
            _Pass: {
                value: new Texture(this.gl)
            }
        }

        this.captureProgram = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                uniforms,
                vertex,
                fragment: capture,
                depthTest: false,
                depthWrite: false,
                cull: null,
            })
        })

        this.captureTarget = this.createCaptureTarget();

    }

    initBlurPasses() {

        this.createBlurBuffers();

        const downSamplePassUniforms = {

            _Image: {
                value: new Texture(this.gl)
            },
            _StepSize: {
                value: 1.0
            },
            _Time: {
                value: 0
            },
            _Resolution: {
                value: new Vec2(this.width, this.height)
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
                uniforms: downSamplePassUniforms,
                transparent: false,
                depthTest: false,
                depthWrite: false
            })
        });

        const upsamplePassUniforms = {

            _Image: {
                value: new Texture(this.gl)
            },
            _StepSize: {
                value: 1.0
            },
            _Time: {
                value: 0
            },
            _Resolution: {
                value: new Vec2(this.width, this.height)
            },
            _Seed: {
                value: 0
            }
        }

        this.upsamplePass = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                vertex,
                fragment: blur_upsample,
                uniforms: upsamplePassUniforms,
                transparent: false,
                depthTest: false,
                depthWrite: false
            })
        });

    }

    createCaptureTarget() {

        return new RenderTarget(this.gl, {
            width: Math.floor(this.width * this.resolutionScale),
            height: Math.floor(this.height * this.resolutionScale)
        })

    }

    render({pass, time}) {

        let scale = 1.0;

        // this.captureProgram.program.uniforms._Pass.value = pass;
        // this.gl.renderer.render({scene: this.captureProgram, target: this.captureTarget, clear: false});

        for (let i = 0; i < this.downSamplePasses.length; i++) {

            this.downsamplePass.program.uniforms._Image.value = i === 0 ? pass.texture : this.downSamplePasses[i - 1].texture;
            this.downsamplePass.program.uniforms._Resolution.value.set(Math.floor(this.width * this.resolutionScale * scale), Math.floor(this.height * this.resolutionScale * scale));
            this.downsamplePass.program.uniforms._Seed.value = i * 100.0 * Math.random();
            this.downsamplePass.program.uniforms._Time.value = time;

            this.gl.renderer.render({scene: this.downsamplePass, target: this.downSamplePasses[i], clear: false});

            scale *= 0.5;

        }

        for (let i = 0; i < this.upsamplePasses.length; i++) {

            scale *= 2.0;

            this.upsamplePass.program.uniforms._Image.value = i === 0 ? this.downSamplePasses[this.downSamplePasses.length - 1].texture : this.upsamplePasses[i - 1].texture;
            this.upsamplePass.program.uniforms._Resolution.value.set(Math.floor(this.width * this.resolutionScale * scale), Math.floor(this.height * this.resolutionScale * scale));
            this.upsamplePass.program.uniforms._Time.value = time;
            this.upsamplePass.program.uniforms._Seed.value = i * 100.0 * Math.random();

            this.gl.renderer.render({scene: this.upsamplePass, target: this.upsamplePasses[i], clear: false});

        }

    }

    //TODO: MAKE SURE THAT THE FIRST AND LAST BLUR PASS TEXTURE HAS CAPTURE TARGET'S RESOLUTION
    createBlurBuffers() {

        const passCount = 3;

        this.downSamplePasses = new Array(passCount);
        this.upsamplePasses = new Array(passCount);

        let scale = 1.0;
        for (let i = 0; i < this.downSamplePasses.length; i++) {

            const textureParams = {
                width: Math.floor(this.width * this.resolutionScale * scale),
                height: Math.floor(this.height * this.resolutionScale * scale),
                minFilter: this.gl.LINEAR,
                magFilter: this.gl.LINEAR,
                format: this.gl.RGB,
                internalFormat: this.gl.RGB,
                depth: false
            }

            this.downSamplePasses[i] = new RenderTarget(this.gl, this.getBlurTextureParams({scale}));
            scale *= 0.5;

        }

        for (let i = 0; i < this.upsamplePasses.length; i++) {

            scale *= 2.0;

            this.upsamplePasses[i] = new RenderTarget(this.gl, this.getBlurTextureParams({scale}));

        }

    }

    getBlurTextureParams({scale}) {
        return {
            width: Math.floor(this.width * this.resolutionScale * scale),
            height: Math.floor(this.height * this.resolutionScale * scale),
            minFilter: this.gl.LINEAR,
            magFilter: this.gl.LINEAR,
            format: this.gl.RGB,
            internalFormat: this.gl.RGB,
            depth: false
        }
    }

    onResize({width, height}) {
        this.setSize({width, height});

        this.captureTarget = this.createCaptureTarget();

        this.createBlurBuffers()
    }

    setSize({width, height}) {
        this.width = width === null ? this.gl.canvas.width : width
        this.height = height === null ? this.gl.canvas.height : height
    }

    get Output() {
        return this.upsamplePasses[this.upsamplePasses.length - 1].texture;
    }

}