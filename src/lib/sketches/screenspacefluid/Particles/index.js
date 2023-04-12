import {Mat4, Mesh, RenderTarget, Texture, Triangle, Vec3} from 'ogl';
import {Program} from 'ogl';
import {Plane} from 'ogl';
import {Geometry} from 'ogl';
import {Shadow} from 'ogl';

import Simulator from './simulation/index.js';
import { Camera } from 'ogl';
import { Vec2 } from 'ogl';
import {Box} from 'ogl';
// import { params } from '../params';

import vertex from './shader/particles.vert?raw';
import fragment from './shader/particles.frag?raw';

import screenQuad from './shader/screenSpaceFluidShaders/screenQuad.vert?raw';
import depthBlur from './shader/screenSpaceFluidShaders/depthBlur.frag?raw';
import calcViewPos from './shader/screenSpaceFluidShaders/calcViewPos.frag?raw';
import calcNormal from './shader/screenSpaceFluidShaders/calcNormal.frag?raw';
import copy from './shader/screenSpaceFluidShaders/copy.frag?raw';

export default class Particles {

    constructor(gl, {camera, normal}) {

        // super(gl, {mode: gl.POINTS});

        this.gl = gl;
        this.camera = camera;

        this.countX = 512;
        this.countY = this.countX;
        this.calcViewportDimensions();
        this.initSimulator();
        this.initGeometry();
        this.initProgram({normal});
        this.initFluidrendering();

    }

    calcViewportDimensions() {

        const dist = this.camera.position.z;
        this.viewportHeight = Math.tan((this.camera.fov * (Math.PI / 180.0)) * 0.5) * dist;
        this.viewportWidth = this.viewportHeight * this.camera.aspect;
    }

    initSimulator() {

        this.simulator = new Simulator(this.gl, {width: this.countX, height: this.countY, camera: this.camera});

    }

    initGeometry() {

        const positionData = new Float32Array(this.countX * this.countY * 3);
        const paramsData = new Float32Array(this.countX * this.countY * 3);
        let positionDataIterator = 0;
        let paramsDataIterator = 0;

        for(let i = 0; i < this.countX * this.countY; i++) {

            positionData[positionDataIterator++] = ((i % this.countX) + 0.5) / this.countX;
            positionData[positionDataIterator++] = (Math.floor(i / this.countY) + 0.5) /this.countY;
            positionData[positionDataIterator++] = 0;

            paramsData[paramsDataIterator++] = Math.random();
            paramsData[paramsDataIterator++] = Math.random();
            paramsData[paramsDataIterator++] = Math.random();
        }

        this.geometry = new Geometry(this.gl, {

            position: {
                size: 3,
                data: positionData
            },
            params: {
                size: 3,
                data: paramsData
            },
        });

    }

    initProgram({normal}) {

        // const shadowParams = gui.addFolder("shadow");
        // shadowParams.add(params.shadow, "BIAS", 0.0, 0.1, 0.0001).listen();

        const uniforms = {

            _Position: this.simulator.Position,
            _Velocity: {
                value: new Texture(this.gl)
            },
            _PrevPos: {
                value: this.simulator.PositionPrev
            },
            _Resolution: {
                value: new Vec2(this.gl.renderer.width, this.gl.renderer.height)
            },
            _ShadowMapTexelSize: {
                value: 1.0 / 1024
            },
            _ShadowWeight: {
                value: 1.0 / 16.0
            },
            _Bias: {
                value: 0.001
            },
            _Normal: {
                value: normal
            },
            _Bounds: {
                value: new Vec2(this.viewportWidth, this.viewportHeight)
            },
            _FlowMap: {
                value: new Texture(this.gl)
            },
            _Light: {
                value: new Vec3(0.0, 5.0, 3.0).normalize()
            }

        }

        this.program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms,
            transparent: false,
            // depthTest: false,
            // depthWrite: false
        });

        // this.program.setBlendFunc(this.gl.ONE, this.gl.ONE);

        this.particles = new Mesh(this.gl, {geometry: this.geometry, program: this.program, mode: this.gl.POINTS})

    }

    initShadowPass({normal}) {

        this.shadowCamera = new Camera(this.gl, {
            near: 1.0,
            far: 20.0,
            left: -5.0,
            right: 5.0,
            top: 5.0,
            bottom: -5.0
        });


        this.shadowCamera.position.set(0.0, 10.0, 5.0);
        this.shadowCamera.lookAt([0.0, 0.0, 0.0]);

        this.shadowPass = new Shadow(this.gl, {light: this.shadowCamera, width: 1024, height: 1024});

        this.shadowPass.add({mesh: this, vertex: shadowVertex, fragment: shadowFragment});

    }

    initFluidrendering() {

        let type;
        // Requested type not supported, fall back to half float
        if (!type) type = this.gl.HALF_FLOAT || this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;

        const width = this.gl.canvas.width;
        const height = this.gl.canvas.height;

        const options = {
            width,
            height,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            minFilter: this.gl.LINEAR,
            magFilter: this.gl.LINEAR,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
        };

        const options2 = {
            width,
            height,
            depthTexture: true,
            // type: this.gl.FLOAT,
            // format: this.gl.RGBA,
            // internalFormat: this.gl.RGBA32F,
            // minFilter: this.gl.NEAREST,
            // magFilter: this.gl.NEAREST,
            // wrapS: this.gl.CLAMP_TO_EDGE,
            // wrapT: this.gl.CLAMP_TO_EDGE,
        };

        this.depthCapture = new RenderTarget(this.gl, options2);

        this.fbo = {
            read: new RenderTarget(this.gl, options),
            write: new RenderTarget(this.gl, options),
            swap: () => {
                let tmp = this.fbo.write;
                this.fbo.write = this.fbo.read;
                this.fbo.read = tmp;
            }
        }

        const geometry = new Triangle(this.gl);

        const depthSmoothingShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: depthBlur,
            uniforms: {
                tDepth: {value: null},
                uBlurScale: {value: 0.1},
                uDepthFallOff: {value: 0.001},
                uBlurDirection: {value: new Vec2(1.0, 0.0)},
                uTexelSize: {value: new Vec2(1.0/width, 1.0/height)},
                uStepSize: {value: 0.5}
            }
        });

        this.depthBlurProgram = new Mesh(this.gl, {geometry, program: depthSmoothingShader});

        const viewPosCalcShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: calcViewPos,
            uniforms: {
                tSmoothedDepth: {value: null},
                uProjectionMatrixInverse: {value: new Mat4()},
                uTexelSize: {value: new Vec2(1.0/width, 1.0/height)},
                uMaxDepth: {value: 0.7},
                uFrustumSize: {value: new Vec2(0.0, 0.0)}
            }
        });

        this.calcViewPosProgram = new Mesh(this.gl, {geometry, program: viewPosCalcShader});

        this.tmpMat = new Mat4();
        const normalCalcShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: calcNormal,
            uniforms: {
                tViewPos: {value: null},
                uProjectionMatrixInverse: {value: new Mat4()},
                uTexelSize: {value: new Vec2(1.0/width, 1.0/height)},
                uMaxDepth: {value: 0.7},
                uFrustumSize: {value: new Vec2(0.0, 0.0)}
            }
        });

        this.calcNormalProgram = new Mesh(this.gl, {geometry, program: normalCalcShader});

        this.copyProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                vertex: screenQuad,
                fragment: copy,
                uniforms: {
                    tMap: {value: new Texture(this.gl)}
                }
            })
        })

    }

    update({scene, flowMap, t}) {

        this.gl.camera.updateMatrixWorld();
        const worldMatrix = this.particles.worldMatrix;

        this.simulator.update({flowMap, worldMatrix, t});

        // this.depthProgram.uniforms._Position = this.simulator.Position;

        // this.shadowPass.render({scene});

        this.particles.program.uniforms._Position = this.simulator.Position;
        this.particles.program.uniforms._PrevPos.value = this.simulator.PositionPrev;
        this.particles.program.uniforms._FlowMap.value = flowMap;
        this.particles.program.uniforms._Velocity.value = this.simulator.velocity.fbo.read.texture;
        this.particles.program.uniforms._Bias.value = 0.005;

        this.gl.renderer.render({scene: this.particles, camera: this.gl.camera, target: this.depthCapture});

        this.copyProgram.program.uniforms.tMap.value = this.depthCapture.depthTexture;
        this.gl.renderer.render({scene: this.copyProgram, camera: this.gl.camera, target: this.fbo.write});
        this.fbo.swap();

        let stpSize = 0.5;

        for(let i = 0; i < 2; i++) {

            //blur in X;
            this.depthBlurProgram.program.uniforms['uBlurDirection'].value.set(1.0, 0.0);
            this.depthBlurProgram.program.uniforms['tDepth'].value = this.fbo.read.texture;
            this.depthBlurProgram.program.uniforms['uStepSize'].value = stpSize;
            this.gl.renderer.render({scene: this.depthBlurProgram, target: this.fbo.write});
            this.fbo.swap();

            stpSize += 1.0;

            // //blur in Y;
            // this.depthBlurProgram.program.uniforms['uBlurDirection'].value.set(0.0, 1.0);
            // this.depthBlurProgram.program.uniforms['tDepth'].value = this.fbo.read.texture;
            // this.gl.renderer.render({scene: this.depthBlurProgram, target: this.fbo.write});
            // this.fbo.swap();

        }

        const h = Math.tan((this.gl.camera.fov * (Math.PI / 180.0)) * 0.5) * this.gl.camera.far
        const w = h * this.gl.camera.aspect;

        this.calcViewPosProgram.program.uniforms['uProjectionMatrixInverse'].value.inverse(this.tmpMat.copy(this.gl.camera.projectionMatrix));
        this.calcViewPosProgram.program.uniforms['uFrustumSize'].value.set(w, h);
        this.calcViewPosProgram.program.uniforms['tSmoothedDepth'].value = this.fbo.read.texture;

        this.gl.renderer.render({scene: this.calcViewPosProgram, target: this.fbo.write});
        this.fbo.swap();

        this.calcNormalProgram.program.uniforms['tViewPos'].value = this.fbo.read.texture;
        this.gl.renderer.render({scene: this.calcNormalProgram, target: this.fbo.write});
        this.fbo.swap();


    }

    onResize() {
        this.simulator.onResize();
    }

}
