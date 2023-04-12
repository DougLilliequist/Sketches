import {Mesh, Program, RenderTarget, Texture, Triangle, Vec2} from "ogl";

import screenQuad from './screenQuad.vert?raw';
import splatData from './splatData.frag?raw';
import jumpFlood from './jumpFlood.frag?raw';
import renderData from './renderData.frag?raw';


export default class JumpFlood {
    constructor(gl, image) {

        this.gl = gl;
        this.stepCount = 2;

        this.width = 64;
        this.height = 64;

        this.maxSteps = Math.ceil(Math.log(this.width) / Math.log(2));

        this.stepCount = this.maxSteps;

        this.initData = new Texture(this.gl, {
            image,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
        });

        this.initBuffers();
        this.initPrograms();

        pane.on('change',  data => {
            if(data.presetKey === 'nSteps') {
                this.stepCount = Math.floor(data.value);
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

        // options.minFilter = this.gl.LINEAR;
        // options.magFilter = this.gl.LINEAR;

        this.dataRes = this.createRenderTarget(options);

    }

    initPrograms() {

        this.geo = new Triangle(this.gl);

        const splatShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: splatData,
            uniforms: {
                tMap: {value: this.initData}
            }
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

        const renderDataShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: renderData,
            uniforms: {
                tMap: {value: new Texture(this.gl)}
            }
        });

        this.renderDataProgram = this.createProgram(renderDataShader);

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


        for(let i = 0; i < this.stepCount; i++) {
            this.program.program.uniforms['uStep'].value = i;
            this.program.program.uniforms['tMap'].value = this.fbo.read.texture;
            this.program.program.uniforms['uStepSize'].value = 1.0 / Math.pow(2, i + 1);
            this.gl.renderer.render({scene: this.program, target: this.fbo.write});
            this.fbo.swap();

        }

        this.renderDataProgram.program.uniforms['tMap'].value = this.fbo.read.texture;
        this.gl.renderer.render({scene: this.renderDataProgram, target: this.dataRes});

    }

    get output() {
        return this.dataRes.texture;
    }

}
