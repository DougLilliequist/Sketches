import {RenderTarget, Plane, Program, Texture, Mesh, Vec2, Vec3, Triangle} from "ogl";

import screenQuad from './shaders/screenQuad.vs.glsl?raw';
import copyDataFS from './shaders/copyData.fs.glsl?raw';
import predictPosition from './shaders/predictPosition.fs.glsl?raw';
import constrainCollide from './shaders/constrainCollide.fs.glsl?raw';
import updateVelocity from './shaders/updateVelocity.fs.glsl?raw';
import computeNormals from './shaders/computeNormals.fs.glsl?raw';
import restLength from './shaders/restLength.fs.glsl?raw';
import restLengthDiagonal from './shaders/diagonalRestLength.fs.glsl?raw';

export default class ClothSimulator {
    constructor(gl, {resolution = new Vec2(64, 64), geometry} = {}) {
        this.gl = gl;
        this.refGeo = geometry;
        this.firstRender = true;
        this.segmentCount = new Vec2().copy(resolution);
        this.subStepCount = 3.0;
        const dt = 1/120
        this.deltaTime = dt;
        this.restLength = new Vec2((1.0/this.segmentCount.x) * 1.0, (1.0/this.segmentCount.y) * 1.0);
        this.diagonalRestLength = this.restLength.len();

        this.initTextures();
        this.initPrograms();
    }

    initTextures() {

        const initPositionData = new Float32Array(this.segmentCount.x * this.segmentCount.y * 4);
        let initPositionIterator = 0;

        for(let y = 0; y < this.segmentCount.y; y++) {

            let phaseY = 2.0 * (y / (this.segmentCount.y - 1.0)) - 1.0;

            for(let x = 0; x < this.segmentCount.x; x++) {

                let phaseX = 2.0 * (x / (this.segmentCount.x - 1.0)) - 1.0;

                initPositionData[initPositionIterator++] = phaseX * 2;
                initPositionData[initPositionIterator++] = phaseY * 2;
                initPositionData[initPositionIterator++] = 0;
                initPositionData[initPositionIterator++] = 1.0;

            }
        }

        this.initPosition = this.createDataTexture({data: initPositionData, size: this.segmentCount.x});

        const initVelocityData = new Float32Array(this.segmentCount.x * this.segmentCount.y * 4);

        let initVelocityIterator = 0;

        for(let y = 0; y < this.segmentCount.y; y++) {
            for(let x = 0; x < this.segmentCount.x; x++) {
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) * 1.0;
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) * 1.0;
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) * 1.0;
                initVelocityData[initVelocityIterator++] = 0.0;

            }
        }

        this.initVelocity = new Texture(this.gl, {
            image: initVelocityData,
            target: this.gl.TEXTURE_2D,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            generateMipmaps: false,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            width: this.segmentCount.x,
            height: this.segmentCount.y,
            flipY: false
        });

        const options = {
            width: this.segmentCount.x,
            height: this.segmentCount.y,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            // internalFormat: this.gl.renderer.isWebgl2 ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA16F) : this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            minFilter: this.gl.NEAREST,
            depth: false,
            unpackAlignment: 1,
        };

        this.positionBuffer = new RenderTarget(this.gl, options);
        this.prevPositionBuffer = new RenderTarget(this.gl, options);
        this.iterationBuffer = new RenderTarget(this.gl, options);
        this.velocityBuffer = new RenderTarget(this.gl, options);
        this.normalsBuffer = new RenderTarget(this.gl, options);
        this.restLengths = new RenderTarget(this.gl, options);
        this.restLengthsDiagonal = new RenderTarget(this.gl, options);
        this.copyBuffer = new RenderTarget(this.gl, options);

    }

    initPrograms() {

        const geometry = new Triangle(this.gl);

        const restLengthShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: restLength,
            uniforms: {
                tPosition: {value: this.initPosition},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)}
            }
        });

        this.restlengthProgram = new Mesh(this.gl, {geometry, program: restLengthShader});

        const restLengthDiagonalShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: restLengthDiagonal,
            uniforms: {
                tPosition: {value: this.initPosition},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)}
            }
        });

        this.restlengthDiagonalProgram = new Mesh(this.gl, {geometry, program: restLengthDiagonalShader});

        const predictPositionShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: predictPosition,
            uniforms: {
                tPosition: { value: null},
                tVelocity: {value: null},
                uTime: {value: 0},
                tNormal: {value: this.normalsBuffer.texture},
                uDeltaTime: {value: this.deltaTime / this.subStepCount},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)},
                uApplyInput: {value: 0.0},
                uInputPos: {value: new Vec3(0, 0,0)}
            },

        });

        this.predictPositionProgram = new Mesh(this.gl, {geometry, program: predictPositionShader});

        const copyDataShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: copyDataFS,
            uniforms: {
                tData: {value: null}
            },
        });

        this.copyDataProgram = new Mesh(this.gl, {geometry, program: copyDataShader});

        const constrainCollideShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: constrainCollide,
            uniforms: {
                tPosition: {value: null},
                tRestLength: {value: new Texture(this.gl)},
                tRestLengthDiagonal: {value: new Texture(this.gl)},
                uRestLength: {value: this.restLength},
                uDiagonalRestLength: {value: this.diagonalRestLength},
                uStiffness: {value: 0.5},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)},
                uDeltaTime: {value: this.deltaTime / this.subStepCount},
                uApplyInput: {value: 0.0},
                uInputPos: {value: new Vec3(0.0, 0.0, 0.0)},
                uConstrainDiagonal: {value: 0.0}
            },
        });

        this.constrainCollideProgram = new Mesh(this.gl, {geometry, program: constrainCollideShader});

        const updateVelocityShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: updateVelocity,
            uniforms: {
                tPosition: {value: null},
                tPrevPosition: {value: null},
                uDeltaTime: {value: this.deltaTime / this.subStepCount},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)}
            },
        });

        this.updateVelocityProgram = new Mesh(this.gl, {geometry, program: updateVelocityShader});

        const normalsShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: computeNormals,
            uniforms: {
                tPosition: {value: null},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)},
            }

        });

        this.normalsProgram = new Mesh(this.gl, {geometry, program: normalsShader});

    }

    preWarm() {
        this.copyDataProgram.program.uniforms.tData.value = this.initPosition;
        this.gl.renderer.render({scene: this.copyDataProgram, target: this.iterationBuffer});

        this.restlengthProgram.program.uniforms.tPosition.value = this.iterationBuffer.texture;
        this.restlengthDiagonalProgram.program.uniforms.tPosition.value = this.iterationBuffer.texture;
        this.gl.renderer.render({scene: this.restlengthProgram, target: this.restLengths});
        this.gl.renderer.render({scene: this.restlengthDiagonalProgram, target: this.restLengthsDiagonal});

        this.constrainCollideProgram.program.uniforms.tRestLength.value = this.restLengths.texture;
        this.constrainCollideProgram.program.uniforms.tRestLengthDiagonal.value = this.restLengthsDiagonal.texture;

        this.copyDataProgram.program.uniforms.tData.value = this.initVelocity;
        this.gl.renderer.render({scene: this.copyDataProgram, target: this.velocityBuffer});
    }

    predictPositions({time, inputPos, interacting} = {}) {

        this.predictPositionProgram.program.uniforms.tVelocity.value = this.velocityBuffer.texture;
        this.predictPositionProgram.program.uniforms.tNormal.value = this.normalsBuffer.texture;
        this.predictPositionProgram.program.uniforms.tPosition.value = this.iterationBuffer.texture;
        this.predictPositionProgram.program.uniforms.uTime.value = time * 0.001;
        // this.predictPositionProgram.program.uniforms.uInputPos.value.copy(inputPos || new Vec2(999, 999));
        // this.predictPositionProgram.program.uniforms.uApplyInput.value = interacting ? 1.0 : 0.0;
        this.gl.renderer.render({scene: this.predictPositionProgram, target: this.positionBuffer});

    }

    solveConstraints({positions, inputPos, interacting, direction}) {

        this.constrainCollideProgram.program.uniforms.tPosition.value = positions?.texture;
        // this.constrainCollideProgram.program.uniforms.uInputPos.value.copy(inputPos);
        // this.constrainCollideProgram.program.uniforms.uApplyInput.value = interacting ? 1.0 : 0.0;
        this.constrainCollideProgram.program.uniforms.uConstrainDiagonal.value = direction;
        this.gl.renderer.render({scene: this.constrainCollideProgram, target: this.iterationBuffer});

    }

    updateVelocity() {

        this.updateVelocityProgram.program.uniforms.tPosition.value = this.iterationBuffer.texture;
        this.updateVelocityProgram.program.uniforms.tPrevPosition.value = this.prevPositionBuffer.texture;
        this.gl.renderer.render({scene: this.updateVelocityProgram, target: this.velocityBuffer});

    }

    computeNormals() {

        this.normalsProgram.program.uniforms.tPosition.value = this.iterationBuffer.texture;
        this.gl.renderer.render({scene: this.normalsProgram, target: this.normalsBuffer});

    }

    update({time, inputPos, interacting} = {}) {

        if(this.firstRender) {
            this.firstRender = false;
            this.preWarm();
            this.computeNormals();
            return;
        }

        //save previous position
        for(let i = 0; i < this.subStepCount; i++) {
            this.copyDataProgram.program.uniforms.tData.value = this.iterationBuffer.texture;
            this.gl.renderer.render({scene: this.copyDataProgram, target: this.prevPositionBuffer});
        this.predictPositions({time, inputPos, interacting});
        this.solveConstraints({positions: this.positionBuffer, inputPos, interacting, direction: 0});
        this.updateVelocity();
        }
        this.computeNormals();
    }

    createDataTexture({data, size}) {

        return new Texture(this.gl, {
            image: data,
            target: this.gl.TEXTURE_2D,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            generateMipmaps: false,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            width: size,
            flipY: false
        })

    }

    get position() {
        return this.iterationBuffer.texture;
    }

    get normals() {
        return this.normalsBuffer.texture;
    }

}
