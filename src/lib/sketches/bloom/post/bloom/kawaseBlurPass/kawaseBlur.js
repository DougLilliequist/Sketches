import {Mesh, Program, RenderTarget, Texture, Triangle, Vec2} from "ogl";

import vertex from './shader/vertex.vert?raw';
import kawaseBlur from './shader/kawaseBlur.frag?raw';
import capture from "$lib/sketches/bloom/post/bloom/shaders/capture.frag?raw";

export default class KawaseBlurPass {
    constructor(gl, {
        width,
        height
    }) {

        this.gl = gl

        this.resolutionScale = 0.25;

        this.setSize({width, height});
        this.initCapturePass();
        this.initProgram();

    }

    setSize({width, height}) {
        this.width = width === null ? this.gl.canvas.width : width
        this.height = height === null ? this.gl.canvas.height : height
    }

    initCapturePass() {

        //TODO: create capture pass so I can get the the FXAA at half resolution

        const uniforms = {
            _Pass: {
                value: new Texture(this.gl)
            },
            _EmissiveMask: {
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

    }

    initProgram() {

        this.createBlurBuffers();

        const uniforms = {
            _Color: {
                value: new Texture(this.gl)
            },
            _Resolution: {
                value: new Vec2(Math.floor(this.width), Math.floor(this.height))
            },
            _Time: {
                value: 0
            },
            _Seed: {
                value: 0
            },
            _StepSize: {
                value: 0.5
            }
        }

        this.program = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                uniforms,
                vertex,
                fragment: kawaseBlur,
                depthTest: false,
                depthWrite: false,
                transparent: false,
                cullFace: null
            })
        });

    }

    render({pass, time}) {

        this.captureProgram.program.uniforms._Pass.value = pass.texture;
        this.gl.renderer.render({scene: this.captureProgram, target: this.blurBuffers[0].buffer, clear: false});

        for(let i = 0; i < this.blurBuffers.length-1; i++) {

            this.program.program.uniforms._Color.value = this.blurBuffers[i].buffer.texture;
            this.program.program.uniforms._Resolution.value.copy(this.blurBuffers[i].resolution);

            this.program.program.uniforms._Time.value = time;
            this.program.program.uniforms._Seed.value = i + Math.random() * 1000.0;
            this.program.program.uniforms._StepSize.value = 0.5 + i;

            this.gl.renderer.render({scene: this.program, target: this.blurBuffers[i+1].buffer, clear: false});

        }

    }

    createBlurBuffers() {

        const bufferCount = 8;

        this.blurBuffers = new Array(bufferCount);

        for (let i = 0; i < this.blurBuffers.length; i++) {

            const textureParams = {
                width: Math.floor(this.width * this.resolutionScale),
                height: Math.floor(this.height * this.resolutionScale),
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

        }

    }

    onResize({width, height}) {



    }

    get Output() {
        return this.blurBuffers[this.blurBuffers.length - 1].buffer.texture
    }

}