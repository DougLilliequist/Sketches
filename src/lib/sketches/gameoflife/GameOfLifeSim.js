import {Mesh, Program, RenderTarget, Texture, Transform, Triangle, Vec2} from "ogl";

import baseVertex from './shaders/baseVertex.glsl?raw';
import display from './shaders/display.glsl?raw';
import gameoflife from './shaders/gameoflife.glsl?raw';
import initseed from './shaders/initseed.glsl?raw';

export default class GameOfLifeSim extends Transform {
    constructor(gl) {
        super();

        this.gl = gl;

        const options = {
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            wrapS: this.gl.REPEAT,
            wrapT: this.gl.REPEAT,
            depth: false
        }

        this.fbo = {
            read: new RenderTarget(this.gl, options),
            write: new RenderTarget(this.gl, options),
            swap: () => {
                const tmp = this.fbo.write;
                this.fbo.write = this.fbo.read;
                this.fbo.read = tmp;
            }
        }

        const geo = new Triangle(this.gl);
        let gameOfLifeProgram = new Program(this.gl, {
            uniforms: {
                tPrev: {value: new Texture(this.gl)},
                uTime: {value: 0},
                uResolution: {value: new Vec2(this.gl.canvas.width, this.gl.canvas.height)}
            },
            vertex: baseVertex,
            fragment: gameoflife,
            depthTest: false,
            depthWrite: false,
            transparent: false
        });

        this.program = new Mesh(this.gl, {
            geometry: geo,
            program: gameOfLifeProgram
        });

        let initSeedShader = new Program(this.gl, {
            uniforms: {
                tPrev: {value: new Texture(this.gl)},
                uTime: {value: 0},
                uResolution: {value: new Vec2(this.gl.canvas.width, this.gl.canvas.height)}
            },
            vertex: baseVertex,
            fragment: initseed,
            depthTest: false,
            depthWrite: false,
            transparent: false
        });

        this.initSeedProgram = new Mesh(this.gl, {
            geometry: geo,
            program: initSeedShader
        });

        const displayShader = new Program(this.gl, {
            uniforms: {
                tMap: {value: new Texture(this.gl)}
            },
            vertex: baseVertex,
            fragment: display,
            depthTest: false,
            depthWrite: false,
            transparent: false
        });

        this.mesh = new Mesh(this.gl, {
            geometry: geo,
            program: displayShader
        });

        this.addChild(this.mesh);
        this.splat();

    }

    splat(t = 0) {

        this.initSeedProgram.program.uniforms['tPrev'].value = this.fbo.read.texture;
        this.initSeedProgram.program.uniforms['uTime'].value = t * 0.0001;
        this.gl.renderer.render({scene: this.initSeedProgram, target: this.fbo.write});
        this.fbo.swap();
        // this.program.program.uniforms['tPrev'].value = this.fbo.write.texture;

    }

    update(t = 0) {

        //(t % 20 <= 0.0) && this.splat(t);
        this.splat(t);
        this.program.program.uniforms['uResolution'].value.set(this.gl.canvas.width, this.gl.canvas.height);
        this.program.program.uniforms['tPrev'].value = this.fbo.read.texture;
        this.program.program.uniforms['uTime'].value = t * 0.0001;

        this.gl.renderer.render({scene: this.program, target: this.fbo.write});

        this.mesh.program.uniforms['tMap'].value = this.fbo.write.texture;
        this.fbo.swap();


    }

    get output() {
        return this.fbo.read.texture;
    }

}
