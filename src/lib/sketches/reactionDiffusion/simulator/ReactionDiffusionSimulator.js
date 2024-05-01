import {Mesh, Program, RenderTarget, Texture, Triangle, Vec2, Vec3} from "ogl";

import baseVertex from './shaders/baseVertex.glsl?raw';
import reactionDiffusion from './shaders/reactionDiffusion.glsl?raw';
import diffusionA from './shaders/diffusionA.glsl?raw';
import diffusionB from './shaders/diffusionB.glsl?raw';
import display from './shaders/display.glsl?raw';
import diffusion from './shaders/diffusion.glsl?raw';
import splat from './shaders/splat.glsl?raw';
import copy from "./shaders/copy.glsl?raw";

export default class ReactionDiffusionSimulator {

    constructor(gl, {width, height}) {

        this.gl = gl;
        this.width = width;
        this.height = height;
        this.isA = true;

        this.initBuffers();
        this.initPrograms();

    }

    initBuffers() {
        this.bufferA = this.createPingPongBuffer(true);
        this.bufferB = this.createPingPongBuffer(true);
        this.splatBuffer = this.createPingPongBuffer(true);
    }

    initPrograms() {

        const geometry = new Triangle(this.gl);

        this.reactionDiffusionProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: reactionDiffusion,
                uniforms: {
                    tDiffuse: {value: null},
                    tA: {value: null},
                    tB: {value: null},
                    uDt: {value: 1.0 / 60},
                    uStep: {value: 1.0 / this.width},
                    uRateA: {value: 1.0},
                    uRateB: {value: 0.5},
                    uFeed: {value: 0.035},
                    uKill: {value: 0.062},
                    uIsA: {value: 1.0}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false
            })
        });

        this.diffuseAProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: diffusionA,
                uniforms: {
                    tA: {value: null},
                    tB: {value: null},
                    uDt: {value: 1.0 / 60},
                    uStep: {value: 1.0 / this.width},
                    uRateA: {value: 1.0},
                    uRateB: {value: 0.125},
                    uFeed: {value: 0.055},
                    uIsA: {value: 1.0}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false
            })
        });

        this.diffuseBProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: diffusionB,
                uniforms: {
                    tA: {value: null},
                    tB: {value: null},
                    uDt: {value: 1.0 / 60},
                    uStep: {value: 1.0 / this.width},
                    uRateA: {value: 1.0},
                    uRateB: {value: 0.5},
                    uFeed: {value: 0.055},
                    uKill: {value: 0.062},
                    uIsA: {value: 1.0}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false
            })
        });

        this.splatProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: splat,
                uniforms: {
                    tA: {value: this.bufferA.read},
                    uInputPos: {value: new Vec2()},
                    uInput: {value: new Vec3()},
                    uDt: {value: 1.0/60},
                    uStep: {value: 1.0/this.width},
                    uRadius: {value: 0.02},
                    uInputMag: {value: 0.0},
                    uAspect: {value: new Vec2(this.gl.canvas.width / this.gl.canvas.height, this.gl.canvas.height/this.gl.canvas.width)}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        this.diffusionProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: diffusion,
                uniforms: {
                    tOld: {value: new Texture(this.gl)},
                    tNew: {value: new Texture(this.gl)},
                    uStep: {value: 1.0 / this.width}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false
            })
        })

        this.display = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: display,
                uniforms: {
                    tDiffusion: {value: new Texture(this.gl)},
                    tDiffusionPrev: {value: new Texture(this.gl)},
                    uStep: {value: 1.0 / this.width},
                    uDt: {value: 1.0/60.0}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false
            })
        })

        this.copyProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: copy,
                uniforms: {
                    tMap: {value: null}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        })

    }

    createPingPongBuffer(linear = false) {
        const fbo = {
            read: this.createBuffer(linear),
            write: this.createBuffer(linear),
            swap: () => {
                const tmp = fbo.write;
                fbo.write = fbo.read;
                fbo.read = tmp;
            }
        }

        return fbo;
    }

    createBuffer(linear = false) {

        const params = {
            width: this.width,
            height: this.height,
            format: this.gl.RGBA,
            type: this.gl.HALF_FLOAT,
            internalFormat: this.gl.RGBA16F,
            // wrapS: this.gl.REPEAT,
            // wrapT: this.gl.REPEAT,
            minFilter: linear ? this.gl.LINEAR : this.gl.NEAREST,
            magFilter: linear ? this.gl.LINEAR : this.gl.NEAREST,
            generateMipmaps: false,
        }

        return new RenderTarget(this.gl, params);
    }

    update(dt, {userInput}) {

        //add chemicals
        let dX = (userInput.deltaX / dt) * 1.0;
        let dY = (userInput.deltaY / dt) * 1.0;
        let inputMag = Math.sqrt(dX * dX + dY * dY);

        this.copyProgram.program.uniforms.tMap.value = this.bufferA.read.texture;
        this.gl.renderer.render({scene: this.copyProgram, target: this.bufferB.write});
        this.bufferB.swap();

        this.splatProgram.program.uniforms.uInputPos.value.set(userInput.posX, userInput.posY);
        this.splatProgram.program.uniforms.uInput.value.set(dX, dY, 1.0);
        this.splatProgram.program.uniforms.uInputMag.value = inputMag;

        this.splatProgram.program.uniforms.tA.value = this.bufferA.read.texture;
        this.splatProgram.program.uniforms.uInput.value.set(1.0, 1.0, 1.0);
        this.gl.renderer.render({scene: this.splatProgram, target: this.bufferA.write});
        this.bufferA.swap();



        this.reactionDiffusionProgram.program.uniforms.tDiffuse.value = this.bufferA.read.texture;
        this.gl.renderer.render({scene: this.reactionDiffusionProgram, target: this.bufferA.write});
        this.bufferA.swap();
            // this.diffusionProgram.program.uniforms.tOld.value = this.bufferB.read.texture;
            // this.diffusionProgram.program.uniforms.tNew.value = this.bufferA.read.texture;
            // this.gl.renderer.render({scene: this.diffusionProgram, target: this.bufferA.write})
            // this.bufferA.swap();

        //
        // this.diffuseBProgram.program.uniforms.tA.value = this.bufferA.read.texture;
        // this.diffuseBProgram.program.uniforms.tB.value = this.bufferB.read.texture;
        //
        // this.gl.renderer.render({scene: this.diffuseBProgram, target: this.bufferB.write});
        // this.bufferB.swap();

        this.display.program.uniforms.tDiffusion.value = this.bufferA.read.texture;
        this.display.program.uniforms.tDiffusionPrev.value = this.bufferB.read.texture;

    }

    get outPut() {
        return this.bufferB.read.texture;
    }

}
