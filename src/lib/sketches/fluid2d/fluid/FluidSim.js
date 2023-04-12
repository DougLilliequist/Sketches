import {Mesh, Triangle, Program, RenderTarget, Vec2, Vec3, Texture} from "ogl";

import baseVertex from './shaders/baseVertex.glsl?raw';
import addForce from './shaders/addForce.glsl?raw';
import diverge from './shaders/diverge.glsl?raw';
import clear from './shaders/clear.glsl?raw';
import poisson from './shaders/poisson.glsl?raw';
import diffuse from './shaders/diffuse.glsl?raw';
import clearDivergence from './shaders/clearDivergence.glsl?raw';
import advect from './shaders/advect.glsl?raw';
import displayFluid from './shaders/displayFluid.glsl?raw'
import applyBounds from './shaders/applyBounds.glsl?raw'
import copy from './shaders/copy.glsl?raw';

export default class FluidSim {

    constructor(gl, {resolution = 512}) {

        this.gl = gl;
        this.width = resolution;
        this.height = resolution;

        this.iterationCount = 20;

        this.initBuffers();
        this.initPrograms();
        this.initFluidDisplay();


    }

    initBuffers() {

        this.velocityBuffer = this.createPingPongBuffer(true);
        this.divergenceBuffer = this.createBuffer();
        this.poissonBuffer = this.createPingPongBuffer();
        this.densityBuffer = this.createPingPongBuffer(true);
        this.copy = this.createBuffer(true);

    }

    initPrograms() {

        const stepSize = 1.0 / this.width;
        const dt = 1 / 60;

        const geometry = new Triangle(this.gl);

        this.addForceProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: addForce,
                uniforms: {
                    tU: {value: this.velocityBuffer.read},
                    uInputPos: {value: new Vec2()},
                    uInput: {value: new Vec3()},
                    uDt: {value: dt},
                    uStep: {value: stepSize},
                    uRadius: {value: 0.005},
                    uInputMag: {value: 0.0},
                    uTime: {value: 0},
                    uAspect: {value: new Vec2(this.gl.canvas.width / this.gl.canvas.height, this.gl.canvas.height/this.gl.canvas.width)}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        this.divergenceProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: diverge,
                uniforms: {
                    tW: {value: null},
                    uStep: {value: stepSize}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        this.clearProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: clear,
                uniforms: {
                    tW: {value: null}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        this.poissonProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: poisson,
                uniforms: {
                    tPressure: {value: null},
                    tDivergence: {value: null},
                    uStep: {value: stepSize},
                    uDt: {value: dt},
                    uAlpha: {value: -1.0},
                    uBeta: {value: 0.25}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        this.diffuseProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: diffuse,
                uniforms: {
                    tPressure: {value: null},
                    tDivergence: {value: null},
                    uStep: {value: stepSize},
                    uDt: {value: dt},
                    uAlpha: {value: -1.0},
                    uBeta: {value: 0.25}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        this.clearDivergenceProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: clearDivergence,
                uniforms: {
                    tW: {value: null},
                    tPressure: {value: null},
                    uStep: {value: stepSize}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        this.advectionProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: advect,
                uniforms: {
                    tU: {value: null},
                    tX: {value: null},
                    uDt: {value: dt},
                    uStep: {value: stepSize},
                    uDissipation: {value: 0.93}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

        this.applyBoundsProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: applyBounds,
                uniforms: {
                    tSource: {value: null},
                    uStep: {value: stepSize},
                    uScale: {value: -1.0},
                    uScalar: {value: 0.0}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false,
            })
        });

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

    initFluidDisplay() {

        this.display = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                vertex: baseVertex,
                fragment: displayFluid,
                uniforms: {
                    tFluid: {value: new Texture(this.gl)},
                    uStep: {value: 1.0 / this.width}
                },
                depthTest: false,
                depthWrite: false,
                transparent: false
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

    createBuffer(linear = false, scale = 1) {

        const params = {
            width: this.width * scale,
            height: this.height * scale,
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
        const stp = 1.0 / this.width;

        //advect / transport velocities!
        this.advectionProgram.program.uniforms.tU.value = this.velocityBuffer.read.texture;
        this.advectionProgram.program.uniforms.tX.value = this.velocityBuffer.read.texture;
        this.advectionProgram.program.uniforms.uDissipation.value = 1.0;
        this.gl.renderer.render({scene: this.advectionProgram, target: this.velocityBuffer.write});
        this.velocityBuffer.swap();

        this.advectionProgram.program.uniforms.tU.value = this.velocityBuffer.read.texture;
        this.advectionProgram.program.uniforms.tX.value = this.densityBuffer.read.texture;
        this.advectionProgram.program.uniforms.uDissipation.value = 1.0 - 0.000001;
        this.gl.renderer.render({scene: this.advectionProgram, target: this.densityBuffer.write});
        this.densityBuffer.swap();

        this.copyProgram.program.uniforms.tMap.value = this.velocityBuffer.read.texture;
        this.gl.renderer.render({scene: this.copyProgram, target: this.copy});

        // diffuse
        let alpha = 0.0001 * dt;
        this.diffuseProgram.program.uniforms.uAlpha.value = alpha;
        this.diffuseProgram.program.uniforms.uBeta.value = 1.0 / (4.0 + alpha);
        for(let i = 0; i < this.iterationCount; i++) {

            this.diffuseProgram.program.uniforms.tPressure.value = this.velocityBuffer.read.texture;
            this.diffuseProgram.program.uniforms.tDivergence.value = this.copy.texture;
            this.gl.renderer.render({scene: this.diffuseProgram, target: this.velocityBuffer.write});
            this.velocityBuffer.swap();

        }

        //add force
        let dX = (userInput.deltaX / dt) * 5.0;
        let dY = (userInput.deltaY / dt) * 5.0;
        let inputMag = Math.sqrt(dX * dX + dY * dY);

        this.addForceProgram.program.uniforms.uInputPos.value.set(userInput.posX, userInput.posY);
        this.addForceProgram.program.uniforms.uInput.value.set(dX, dY, 1.0);
        this.addForceProgram.program.uniforms.uInputMag.value = inputMag;
        this.addForceProgram.program.uniforms.uTime.value += dt;

        this.addForceProgram.program.uniforms.tU.value = this.velocityBuffer.read.texture;
        this.gl.renderer.render({scene: this.addForceProgram, target: this.velocityBuffer.write});
        this.velocityBuffer.swap();

        //update density
        this.addForceProgram.program.uniforms.tU.value = this.densityBuffer.read.texture;
        // this.addForceProgram.program.uniforms.uInput.value.set(1.0, 1.0, 1.0);
        this.addForceProgram.program.uniforms.uInput.value.set(Math.abs(userInput.deltaX), Math.abs(userInput.deltaY), 1.0);
        this.gl.renderer.render({scene: this.addForceProgram, target: this.densityBuffer.write});
        this.densityBuffer.swap();

        //compute divergence on velocity field
        this.divergenceProgram.program.uniforms.tW.value = this.velocityBuffer.read.texture;
        this.gl.renderer.render({scene: this.divergenceProgram, target: this.divergenceBuffer});

        //clear pressure
        this.clearProgram.program.uniforms.tW.value = this.poissonBuffer.read.texture;
        this.gl.renderer.render({scene: this.clearProgram, target: this.poissonBuffer.write});
        this.poissonBuffer.swap();

        // this.poissonProgram.program.uniforms.uAlpha.value = -(stp * stp);
        this.poissonProgram.program.uniforms.uAlpha.value = -(1);
        this.poissonProgram.program.uniforms.uBeta.value = 0.25;

        //perform jacobi iterations to determine pressure
        for(let i = 0; i < this.iterationCount; i++) {

            this.poissonProgram.program.uniforms.tPressure.value = this.poissonBuffer.read.texture;
            this.poissonProgram.program.uniforms.tDivergence.value = this.divergenceBuffer.texture;
            this.gl.renderer.render({scene: this.poissonProgram, target: this.poissonBuffer.write});
            this.poissonBuffer.swap();

        }

        //clear divergence from current velocity field
        this.clearDivergenceProgram.program.uniforms.tW.value = this.velocityBuffer.read.texture;
        this.clearDivergenceProgram.program.uniforms.tPressure.value = this.poissonBuffer.read.texture
        this.gl.renderer.render({scene: this.clearDivergenceProgram, target: this.velocityBuffer.write});
        this.velocityBuffer.swap();

        this.applyBoundsProgram.program.uniforms.tSource.value = this.velocityBuffer.read.texture;
        this.applyBoundsProgram.program.uniforms.uScalar.value = 0.0;
        this.gl.renderer.render({scene: this.applyBoundsProgram, target: this.velocityBuffer.write});
        this.velocityBuffer.swap();

        this.display.program.uniforms.tFluid.value = this.densityBuffer.read.texture;

    }

    get outPut() {
        return this.velocityBuffer.read.texture;
    }

}
