import {Mesh, Program, RenderTarget, Texture, Triangle, Vec2, Vec3} from "ogl";

import baseVertex from './shaders/baseVertex.glsl?raw';
import reactionDiffusion from './shaders/reactionDiffusion.glsl?raw';
import display from './shaders/display.glsl?raw';
import ripple from './shaders/ripple.glsl?raw';
import splat from './shaders/splat.glsl?raw';
import copy from "./shaders/copy.glsl?raw";

export default class RippleSimulator {

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
        // this.bufferB = this.createPingPongBuffer(true);
        this.bufferB = this.createBuffer(true);
        // this.splatBuffer = this.createPingPongBuffer(true);
        this.splatBuffer = this.createBuffer(true);
        this.reactionDiffusionBuffer = this.createPingPongBuffer(true);
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
                    uFeed: {value: 0.055},
                    uKill: {value: 0.062},
                    uIsA: {value: 1.0}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false
            })
        });

        const dt = 1/60;
        const c = 100 //original

        const alpha = 1 / (c * c)

        this.rippleProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: ripple,
                uniforms: {
                    tCurrent: {value: null},
                    tPrev: {value: null},
                    uStep: {value: 1.0 / this.width},
                    uAlpha: {value: (c * c) * (dt * dt) / 1},
                    // uAlpha: {value: alpha},
                    uDt: {value: dt}
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
                    // uRadius: {value: 0.00015},
                    uRadius: {value: 0.0001},
                    uInputMag: {value: 0.0},
                    uAspect: {value: new Vec2(this.gl.canvas.width / this.gl.canvas.height, this.gl.canvas.height/this.gl.canvas.width)}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        const img = new Image();
        img.src = 'src/lib/sketches/ripple2d/assets/koi.jpeg';
        const t = new Texture(this.gl);
        img.onload = _ => t.image = img;

        this.display = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: display,
                uniforms: {
                    tDiffusion: {value: new Texture(this.gl)},
                    tDiffusionPrev: {value: new Texture(this.gl)},
                    uStep: {value: 1.0 / this.width},
                    tMap: {value: t},
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
                const tmp = fbo.read;
                fbo.read = fbo.write;
                fbo.write = tmp;
            }
        }

        return fbo;
    }

    createBuffer(linear = false) {

        const params = {
            width: this.width,
            height: this.height,
            // format: this.gl.RGBA,
            format: this.gl.RED,
            type: this.gl.HALF_FLOAT,
            internalFormat: this.gl.R16F,
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
        let dX = (userInput.deltaX / dt) * 1;
        let dY = (userInput.deltaY / dt) * 1;
        let inputMag = Math.sqrt(dX * dX + dY * dY);

        this.copyProgram.program.uniforms.tMap.value = this.bufferA.write.texture;
        this.gl.renderer.render({scene: this.copyProgram, target: this.bufferB});

        this.splatProgram.program.uniforms.uInputPos.value.set(userInput.posX, userInput.posY);
        this.splatProgram.program.uniforms.uInputMag.value = inputMag;
        this.splatProgram.program.uniforms.tA.value = this.bufferA.read.texture;
        this.splatProgram.program.uniforms.uInput.value.set(1.0, 1.0, 1.0);
        this.gl.renderer.render({scene: this.splatProgram, target: this.bufferA.write});
        this.bufferA.swap();

        this.rippleProgram.program.uniforms.tCurrent.value = this.bufferA.read.texture;
        this.rippleProgram.program.uniforms.tPrev.value = this.bufferB.texture;
        this.rippleProgram.program.uniforms.uDt.value = dt;
        this.gl.renderer.render({scene: this.rippleProgram, target: this.bufferA.write});
        this.bufferA.swap();

        this.display.program.uniforms.tDiffusion.value = this.bufferA.read.texture;
        this.display.program.uniforms.tDiffusionPrev.value = this.bufferB.texture;

    }

    get outPut() {
        return this.bufferA.read.texture;
    }

}
