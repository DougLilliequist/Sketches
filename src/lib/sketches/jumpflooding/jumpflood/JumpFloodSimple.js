import {Mesh, Program, RenderTarget, Texture, Triangle, Vec2} from "ogl";

import screenQuad from './screenQuad.vert?raw';
import splatData from './splatDataSimple.frag?raw';
import jumpFlood from './jumpFloodSimple.frag?raw';

export default class JumpFloodSimple {
    constructor(gl) {

        this.gl = gl;

        this.width = 64;
        this.height = 64;

        this.maxSteps = Math.ceil(Math.log(this.width) / Math.log(2));
        this.stepCount = this.maxSteps;

        this.initBuffers();
        this.initPrograms();

        pane.on('change',  data => {
            if(data.presetKey === 'nSteps') {
                this.stepCount = Math.min(Math.floor(data.value), this.maxSteps);
            }
        });

    }

    initBuffers() {

        let type;
        if (!type) type = this.gl.HALF_FLOAT || this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;

        const options = {
            width: this.width,
            height: this.height,
            type,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA16F) : this.gl.RGBA,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
        };

        this.splatTarget = this.createRenderTarget(options);

        this.fbo = {
            read: this.createRenderTarget(options),
            write: this.createRenderTarget(options),
            swap: () => {
                let tmp = this.fbo.read;
                this.fbo.read = this.fbo.write;
                this.fbo.write = tmp;
            }
        }

    }

    initPrograms() {

        this.geo = new Triangle(this.gl);

        const splatShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: splatData
        });

        this.splatProgram = this.createProgram(splatShader);

        const jumpfloodShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: jumpFlood,
            uniforms: {
                tMap: {value: new Texture(this.gl)},
                uStep: {value: 0},
                uStepSize: {value: 1.0},
                uTextureResolution: {value: new Vec2(this.width, this.height)}
            }
        });

        this.program = this.createProgram(jumpfloodShader);

    }

    createProgram(program) {
        return new Mesh(this.gl, {geometry: this.geo, program});
    }

    createRenderTarget(options) {
        return new RenderTarget(this.gl, options)
    }

    update() {

        this.gl.renderer.render({scene: this.splatProgram, target: this.fbo.write});
        this.fbo.swap();

        let stpSize = 0.5;
        for(let i = 0; i < this.stepCount; i++) {
            this.program.program.uniforms['uStep'].value = i;
            this.program.program.uniforms['tMap'].value = this.fbo.read.texture;
            this.program.program.uniforms['uStepSize'].value = stpSize;
            this.gl.renderer.render({scene: this.program, target: this.fbo.write});
            this.fbo.swap();
            stpSize *= 0.5;
        }

    }

    get output() {
        return this.fbo.read.texture;
    }

}
