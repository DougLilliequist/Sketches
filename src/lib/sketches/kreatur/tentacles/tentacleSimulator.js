import {RenderTarget, Plane, Program, Texture, Mesh, Vec2, Vec3, Triangle} from "ogl";

import screenQuad from './shaders/screenQuad.vs.glsl?raw';
import copyDataFS from './shaders/copyData.fs.glsl?raw';
import predictPosition from './shaders/predictPosition.fs.glsl?raw';
import constrainCollide from './shaders/constrainCollide.fs.glsl?raw';
import updateVelocity from './shaders/updateVelocity.fs.glsl?raw';
import computeTangents from './shaders/computeTangents.fs.glsl?raw';

export default class TentacleSimulator {

    constructor(gl, {rootPositions, resolutionCount}) {
        this.gl = gl;
        this.firstRender = true;
        this.segmentCountTentacleCount = new Vec2().copy(resolutionCount);

        this.subStepCount = 8.0;
        // this.deltaTime = 0.015 / this.subStepCount;
        //this.deltaTime = 0.016 / this.subStepCount;

        const hz = (1/120);
        this.deltaTime = hz / this.subStepCount;
        // this.deltaTime = hz;

        this.rootPositions = rootPositions;
        this.restLength = new Vec2((1.0/this.segmentCountTentacleCount.x), 1.0/this.segmentCountTentacleCount.y);

        this.initTextures();
        this.initPrograms();

        this.preWarm();

    }

    initTextures() {

        const initPositionData = new Float32Array(this.segmentCountTentacleCount.x * this.segmentCountTentacleCount.y * 4);
        let initPositionIterator = 0;
        let offset = 0.0;
        for(let y = 0; y < this.segmentCountTentacleCount.y; y++) {

            let phaseY = 2.0 * (y / (this.segmentCountTentacleCount.y - 1.0)) - 1.0;

            for(let x = 0; x < this.segmentCountTentacleCount.x; x++) {

                let phaseX = 2.0 * (x / (this.segmentCountTentacleCount.x - 1.0)) - 1.0;

                initPositionData[initPositionIterator++] = 0.0;
                initPositionData[initPositionIterator++] = 0.0;
                initPositionData[initPositionIterator++] = 0;
                initPositionData[initPositionIterator++] = 1.0;

                offset += this.restLength.x;

            }
        }

        this.initPosition = this.createDataTexture({data: initPositionData, width: this.segmentCountTentacleCount.x, height: this.segmentCountTentacleCount.y});

        const initVelocityData = new Float32Array(this.segmentCountTentacleCount.x * this.segmentCountTentacleCount.y * 4);

        let initVelocityIterator = 0;

        for(let y = 0; y < this.segmentCountTentacleCount.y; y++) {
            for(let x = 0; x < this.segmentCountTentacleCount.x; x++) {
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) *this.deltaTime*0.0;
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) *this.deltaTime*0.0;
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) *this.deltaTime*0.0;
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) *this.deltaTime*0.0;

            }
        }

        this.initVelocity = new Texture(this.gl, {
            image: initVelocityData,
            target: this.gl.TEXTURE_2D,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            generateMipmaps: false,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            width: this.segmentCountTentacleCount.x,
            height: this.segmentCountTentacleCount.y,
            flipY: false
        });

        const options = {
            width: this.segmentCountTentacleCount.x,
            height: this.segmentCountTentacleCount.y,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            // internalFormat: this.gl.renderer.isWebgl2 ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA16F) : this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            minFilter: this.gl.NEAREST,
            depth: false,
            unpackAlignment: 1,
        };

        this.positionBuffer = new RenderTarget(this.gl, {
            width: this.segmentCountTentacleCount.x,
            height: this.segmentCountTentacleCount.y,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            // internalFormat: this.gl.renderer.isWebgl2 ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA16F) : this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            minFilter: this.gl.NEAREST,
            depth: false,
            unpackAlignment: 1,
            color: 2
        });
        this.prevPositionBuffer = new RenderTarget(this.gl, options);
        this.iterationBuffer = new RenderTarget(this.gl,  {
            width: this.segmentCountTentacleCount.x,
            height: this.segmentCountTentacleCount.y,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            // internalFormat: this.gl.renderer.isWebgl2 ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA16F) : this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            minFilter: this.gl.NEAREST,
            depth: false,
            unpackAlignment: 1,
            color: 2
        });
        this.velocityBuffer = new RenderTarget(this.gl, options);
        this.tangentsBuffer = new RenderTarget(this.gl, options);
        this.solvedPositionsBuffer = new RenderTarget(this.gl, options);

    }

    initPrograms() {

        const geometry = new Triangle(this.gl);
        console.log(this.deltaTime);

        const predictPositionShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: predictPosition,
            uniforms: {
                tPosition: {
                    value: this.initPosition
                },
                tVelocity: {
                    value: this.initVelocity
                },
                uOrigin: {
                    value: new Vec3()
                },
                uRootPositions: {
                    value: this.rootPositions
                },
                uDeltaTime: {
                    value: this.deltaTime
                },
                uTexelSize: {
                    value: new Vec2(1.0 / this.segmentCountTentacleCount.x, 1.0/this.segmentCountTentacleCount.y)
                },
                uApplyInput: {
                    value: 0.0
                },
                uInputPos: {
                    value: new Vec3(0, 0,0)
                },
                uTime: {
                    value: 0
                }
            },

        });

        this.predictPositionProgram = new Mesh(this.gl, {geometry, program: predictPositionShader});

        const copyDataShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: copyDataFS,
            uniforms: {
                tData: {
                    value: null
                }
            },
        });

        this.copyDataProgram = new Mesh(this.gl, {geometry, program: copyDataShader});

        const constrainCollideShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: constrainCollide,
            uniforms: {
                tPosition: {
                    value: null
                },
                uRestLength: {
                    value: this.restLength
                },
                uStiffness: {
                    //value: 1.0
                    value: 2.0
                },
                uOrigin: {
                    value: new Vec3()
                },
                uTexelSize: {
                    value: new Vec2(1.0 / this.segmentCountTentacleCount.x, 1.0/this.segmentCountTentacleCount.y)
                },
                uDeltaTime: {
                    value: this.deltaTime
                },
                uApplyInput: {
                    value: 0.0
                },
                uInputPos: {
                    value: new Vec3(0.0, 0.0, 0.0)
                }
            },
        });

        this.constrainCollideProgram = new Mesh(this.gl, {geometry, program: constrainCollideShader});

        const updateVelocityShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: updateVelocity,
            uniforms: {
                tPosition: {
                    value: null
                },
                tPrevPosition: {
                    value: null
                },
                tNextCorrection: {
                    value: null
                },
                uDeltaTime: {
                    value: this.deltaTime
                },
                uTexelSize: {
                    value: new Vec2(1.0 / this.segmentCountTentacleCount.x, 1.0/this.segmentCountTentacleCount.y)
                }
            },
        });

        this.updateVelocityProgram = new Mesh(this.gl, {geometry, program: updateVelocityShader});

        const normalsShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: computeTangents,
            uniforms: {
                tPosition: {
                    value: null
                },
                uTexelSize: {
                    value: new Vec2(1.0 / this.segmentCountTentacleCount.x, 1.0/this.segmentCountTentacleCount.y)
                },
            }

        });

        this.normalsProgram = new Mesh(this.gl, {geometry, program: normalsShader});

    }

    preWarm() {
        this.copyDataProgram.program.uniforms.tData.value = this.initPosition;
        this.gl.renderer.render({scene: this.copyDataProgram, target: this.iterationBuffer});

        this.copyDataProgram.program.uniforms.tData.value = this.initVelocity;
        this.gl.renderer.render({scene: this.copyDataProgram, target: this.velocityBuffer});

        // this.copyDataProgram.program.uniforms.tData.value = this.initPosition;
        // this.gl.renderer.render({scene: this.copyDataProgram, target: this.prevPositionBuffer});
    }

    predictPositions({inputPos, interacting = false, bodyPos} = {}) {
        this.predictPositionProgram.program.uniforms.tVelocity.value = this.velocityBuffer.texture;
        this.predictPositionProgram.program.uniforms.tPosition.value = this.iterationBuffer.textures[0];
        this.predictPositionProgram.program.uniforms.uRootPositions.value = this.rootPositions;
        this.predictPositionProgram.program.uniforms.uOrigin.value.copy(bodyPos);
        if(inputPos) this.predictPositionProgram.program.uniforms.uInputPos.value.copy(inputPos);
        this.predictPositionProgram.program.uniforms.uApplyInput.value = interacting ? 1.0 : 0.0;
        this.predictPositionProgram.program.uniforms.uTime.value += this.gl.dt;
        this.gl.renderer.render({scene: this.predictPositionProgram, target: this.positionBuffer});
    }

    solveConstraints({inputPos, interacting = false, bodyPos} = {}) {
        this.constrainCollideProgram.program.uniforms.tPosition.value = this.positionBuffer.textures[1];
        this.constrainCollideProgram.program.uniforms.uOrigin.value.copy(bodyPos);
        if(inputPos) this.constrainCollideProgram.program.uniforms.uInputPos.value.copy(inputPos);
        this.constrainCollideProgram.program.uniforms.uApplyInput.value = interacting ? 1.0 : 0.0;
        this.gl.renderer.render({scene: this.constrainCollideProgram, target: this.iterationBuffer});
    }

    updateVelocity() {

        this.updateVelocityProgram.program.uniforms.tPosition.value = this.iterationBuffer.textures[0];
        this.updateVelocityProgram.program.uniforms.tPrevPosition.value = this.positionBuffer.textures[0];
        this.updateVelocityProgram.program.uniforms.tNextCorrection.value = this.iterationBuffer.textures[1];
        this.gl.renderer.render({scene: this.updateVelocityProgram, target: this.velocityBuffer});

    }

    computeTangents() {
        this.normalsProgram.program.uniforms.tPosition.value = this.iterationBuffer.textures[0];
        this.gl.renderer.render({scene: this.normalsProgram, target: this.tangentsBuffer});
    }

    update({inputPos = null, interacting = false, rootPositions, bodyPos} = {}) {

        this.rootPositions = rootPositions;

        for(let i = 0; i < this.subStepCount; i++) {
            this.predictPositions({inputPos, interacting, bodyPos});
            this.solveConstraints({inputPos, interacting, bodyPos});
            this.updateVelocity();
        }

        this.computeTangents();
    }

    createDataTexture({data, width, height}) {

        return new Texture(this.gl, {
            image: data,
            target: this.gl.TEXTURE_2D,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            generateMipmaps: false,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            width,
            height,
            flipY: false
        })

    }

    get positions() {
        return this.iterationBuffer.textures[0];
    }

    get tangents() {
        return this.tangentsBuffer.texture;
    }

}
