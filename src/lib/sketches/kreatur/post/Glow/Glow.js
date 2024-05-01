import {Mesh, Program, RenderTarget, Texture, Triangle, Vec2} from "ogl";

import downSample from './downSample.glsl?raw';
import upSample from './upSample.glsl?raw';
import blitMask from './blitMask.glsl?raw';
import blitVert from '../blit.vert.glsl?raw';

export default class Glow {
    constructor(gl, {
        passCount = 5,
        hdr = false
    } = {}) {

        this.gl = gl;

        this.passCount = passCount;
        this.passes = [];
        this.passesUp = [];

        this.initBuffers();
        this.initPrograms();

    }

    initBuffers() {

        let scale = 1;

        for(let i = 0; i < this.passCount; i++) {

            let {width, height} = this.gl.canvas;
            const pass = new RenderTarget(this.gl, {width: Math.round(width * scale), height: Math.round(height * scale), generateMipMaps: false})
            const passUp = new RenderTarget(this.gl, {width: Math.round(width * scale), height: Math.round(height * scale), generateMipMaps: false})
            this.passes.push(pass);
            this.passesUp.push(passUp);
            scale *= 0.5;

        }

    }

    initPrograms() {

        const geo = new Triangle(this.gl);

        this.downSampleShader = new Program(this.gl, {
            uniforms: {
                tMap: {
                    value: new Texture(this.gl)
                },
                uTexelSize: {
                    value: new Vec2(1.0, 1.0)
                }
            },
            vertex: blitVert,
            fragment: downSample,
            depthTest: false,
            depthWrite: false
        });

        this.upSampleShader = new Program(this.gl, {
            uniforms: {
                tMap: {
                    value: new Texture(this.gl)
                },
                tNext: {
                    value: new Texture(this.gl)
                },
                uTexelSize: {
                    value: new Vec2(1.0, 1.0)
                }
            },
            vertex: blitVert,
            fragment: upSample,
            depthTest: false,
            depthWrite: false,
            blendFunc: { src: this.gl.ONE, dst: this.gl.ONE }
        });

        this.blitPass = new Program(this.gl, {
            uniforms: {
                tMap: {value: new Texture(this.gl)},
                uApplyMask: {value: 0}
            },
            vertex: blitVert,
            fragment: blitMask,
            depthTest: false,
            depthWrite: false
        });

        this.blitProgram = new Mesh(this.gl, {
            geometry: geo,
            program: this.blitPass
        })

        this.downSampleProgram = new Mesh(this.gl, {geometry: geo, program: this.downSampleShader});
        this.upSampleProgram = new Mesh(this.gl, {geometry: geo, program: this.upSampleShader});

    }

    render({inputTexture} = {}) {

        if(!inputTexture) return;

        //down sample..
        for(let i = 0; i < this.passCount - 1; i++) {
            this.downSampleProgram.program.uniforms.tMap.value = i === 0 ? inputTexture : this.passes[i].texture;
            this.downSampleProgram.program.uniforms.uTexelSize.value.set(1.0 / this.passes[i].width, 1.0 / this.passes[i].height);
            this.gl.renderer.render({scene: this.downSampleProgram, target: this.passes[i + 1]});
        }

        //up sample..
        for(let i = this.passCount - 1; i >= 0; i--) {
            this.upSampleProgram.program.uniforms.tMap.value = i === this.passCount - 1 ? this.passes[i].texture : this.passesUp[i + 1].texture;
            this.upSampleProgram.program.uniforms.tNext.value = this.passes[i].texture;

            const texelSizeX = i === this.passCount - 1 ? 1.0 / this.passes[i].texture.width : 1.0 / this.passesUp[i+1].width;
            const texelSizeY = i === this.passCount - 1 ? 1.0 / this.passes[i].texture.height : 1.0 / this.passesUp[i+1].height;

            this.upSampleProgram.program.uniforms.uTexelSize.value.set(texelSizeX, texelSizeY);
            this.gl.renderer.render({scene: this.upSampleProgram, target: this.passesUp[i]});
        }

    }

    onResize() {

        let scale = 1;

        for(let i = 0; i < this.passCount + 1; i++) {

            let {width, height} = this.gl.canvas;
            this.passes[i].setSize(Math.round(width * scale), Math.round(height * scale));
            scale *= 0.5;

        }

    }

    get output() {
        return this.passesUp[0];
    }

}
