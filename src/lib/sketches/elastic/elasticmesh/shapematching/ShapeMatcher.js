import {Geometry, Program, RenderTarget, Triangle, Mesh, Texture, Vec3, Mat4, Raycast, Vec2} from "ogl";
import {GpuPicker} from "$lib/sketches/elastic/elasticmesh/gpupicker/GpuPicker.js";

import bigTriangle from './shaders/bigTriangle.vert?raw';
import copy from './shaders/copy.glsl?raw';

import sumVert from './shaders/sum.vert?raw';
import sumFrag from './shaders/sum.frag?raw';
import blitDataVert from './shaders/blitData.vert?raw';
import blitDataFrag from './shaders/blitData.frag?raw';

import predictPositionsVert from './shaders/predictPositions.vert?raw';
import predictPositionsFrag from './shaders/predictPositions.frag?raw';
import solvePositionsVert from './shaders/solvePositions.vert?raw';
import solvePositionsFrag from './shaders/solvePositions.frag?raw';
import updateVelocityVert from './shaders/updateVelocity.vert?raw';
import updateVelocityFrag from './shaders/updateVelocity.frag?raw';
import calcRelativePositionsVert from './shaders/calcRelativePositions.vert?raw';
import calcRelativePositionsFrag from './shaders/calcRelativePositions.frag?raw';
import calcMatrixAVert from './shaders/calcMatrixA.vert?raw';
import calcMatrixAFrag from './shaders/calcMatrixA.frag?raw';
import calcRotationVert from './shaders/calcRotation.vert?raw';
import calcRotationFrag from './shaders/calcRotation.frag?raw';
import applyGoalPositionsVert from './shaders/applyGoalPositions.vert?raw';
import applyGoalPositionsFrag from './shaders/applyGoalPositions.frag?raw';
import updateNormalsVert from './shaders/updateNormals.vert?raw';
import updateNormalsFrag from './shaders/updateNormals.frag?raw';
import calcRestLengthsVert from './shaders/calcRestLengths.vert?raw';
import calcRestLengthsFrag from './shaders/calcRestLengths.frag?raw';
import calcPickedRestLengthsVert from './shaders/calcPickedRestLengths.vert?raw';
import calcPickedRestLengthsFrag from './shaders/calcPickedRestLengths.frag?raw';

export class ShapeMatcher {
    constructor(gl, {
        geometry = null
    } = {}) {

        /**
         * TODO:
         * - once I'm able to see the head fall down to floor and have
         * shape matching applied...
         *  - Build GPU picker
         */

        if(!geometry) {
            console.error('no geometry supplied');
            return;
        }

        this.gl = gl;

        this.refGeometry = geometry;
        const {position} = this.refGeometry.attributes;

        this.SIZE = Math.pow(2, Math.ceil(Math.log2(Math.ceil(Math.sqrt(position.count)))));
        this.REDUCTION_STEPS = Math.floor(Math.log2(this.SIZE));
        this.USE_REDUCTIONS = false;

        this.SUBSTEPS = 2;
        this.firstTick = true;
        this.firstMatrixCalc = true;
        this.dt = 1;
        this.worldMatrix = new Mat4().identity();
        this.hitPoint = new Vec3(999, 999, 999);
        this.localHitPoint = new Vec3(999, 999, 999);
        this.initHitPoint = new Vec3(999, 999 ,999);
        this.dragging = false;
        this.hitBlitted = false;

        this.initBuffers();
        this.initShapeMatchingBuffers();
        this.initPrograms();
        this.addHandlers();

    }

    initBuffers() {

        const options = {
            width: this.SIZE,
            height: this.SIZE,
            generateMipmaps: false,
            format: this.gl.RGBA,
            type: this.gl.FLOAT,
            internalFormat: this.gl.RGBA32F,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            depth: false
        };

        //not sure if needed?
        const initPosNormalOptions = Object.assign({}, options);
        initPosNormalOptions.color = 2;

        //attachments:
        // - 0: initial position
        // - 1: initial normal
        this.initPositionNormal = new RenderTarget(this.gl, initPosNormalOptions);

        const posBufferOptions = Object.assign({}, options);
        posBufferOptions.color = 2;

        //attachments:
        // - 0: predicted position
        // - 1: previous position
        this.positionBuffer = new RenderTarget(this.gl, posBufferOptions);

        this.solvedPositionsBuffer = {
            read: new RenderTarget(this.gl, options),
            write: new RenderTarget(this.gl, options),
            swap: _=> {
                const tmp = this.solvedPositionsBuffer.read;
                this.solvedPositionsBuffer.read = this.solvedPositionsBuffer.write;
                this.solvedPositionsBuffer.write = tmp;
            }
        }

        this.normalBuffer = new RenderTarget(this.gl, options);
        this.velocityBuffer = new RenderTarget(this.gl, options);

        this.copyBuffer = new RenderTarget(this.gl, options);

        const restLengthOptions = Object.assign({}, options);
        restLengthOptions.format = this.gl.RED;
        restLengthOptions.internalFormat = this.gl.R32F;

        //buffer containing rest lengths between the picked particle
        //and all other particles
        this.pickedRestLengthsBuffer = new RenderTarget(this.gl, restLengthOptions);

        //initial rest lengths to make the mesh stick in place
        this.restLenghtsBuffer = new RenderTarget(this.gl, restLengthOptions);

    }

    initShapeMatchingBuffers() {

        const options = {
            width: this.SIZE,
            height: this.SIZE,
            generateMipmaps: false,
            format: this.gl.RGBA,
            type: this.gl.FLOAT,
            internalFormat: this.gl.RGBA32F,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            depth: false
        };

        const singlePixelOptions = Object.assign({}, options);
        singlePixelOptions.width = 1;
        singlePixelOptions.height = 1;

        const matrixBufferOptions = Object.assign({}, options);
        matrixBufferOptions.color = 3;

        this.relativePositionsBuffer = new RenderTarget(this.gl, options);
        this.initRelativePositionsBuffer = new RenderTarget(this.gl, options);

        //AQQ buffer
        //each attachment represents one matrix row
        //EDIT: because the matrix rotation method does not rely on the initial matrix...I might not need this...
        this.qqBuffer = new RenderTarget(this.gl, matrixBufferOptions);
        this.AQQABuffer = new RenderTarget(this.gl, singlePixelOptions);
        this.AQQBBuffer = new RenderTarget(this.gl, singlePixelOptions);
        this.AQQCBuffer = new RenderTarget(this.gl, singlePixelOptions);

        //APQ buffer
        //same as the AQQ buffer, each attachment represents one matrix row
        this.pqBuffer = new RenderTarget(this.gl, matrixBufferOptions);
        this.APQABuffer = new RenderTarget(this.gl, singlePixelOptions);
        this.APQBBuffer = new RenderTarget(this.gl, singlePixelOptions);
        this.APQCBuffer = new RenderTarget(this.gl, singlePixelOptions);

        //buffer containing the matrix rows that contains
        //the resulting matrix that will be applied to the goal positions
        const finalMatrixOptions = Object.assign({}, singlePixelOptions);
        finalMatrixOptions.color = 4;

        this.finalRotationAndMatrixBuffer = new RenderTarget(this.gl, finalMatrixOptions);

        this.prevRotationBuffer = new RenderTarget(this.gl, singlePixelOptions);
        this.initCenterOfMassBuffer =  new RenderTarget(this.gl, singlePixelOptions);
        this.centerOfMassBuffer = new RenderTarget(this.gl, singlePixelOptions);

        //fuck off iOS...(can't use 32-bit float buffers and additively blend...)
        if(this.USE_REDUCTIONS) {
            const reductionOptions = Object.assign({}, options);
            //since we are rendering the final result to the previously made buffers
            //no need to make an additional single pixel sized texture
            this.reductions = [];
            for(let i = this.REDUCTION_STEPS; i > 0; i--) {
                const resolution = Math.pow(2, i);
                reductionOptions.width = resolution;
                reductionOptions.height = resolution;
                this.reductions.push(new RenderTarget(this.gl, reductionOptions));
            }
        }

    }

    initPrograms() {

        const copyGeo = new Triangle(this.gl);

        //necessary programs for position based dynamics
        //------------------------------------------------
        const geometry = new Geometry(this.gl, {
            position: {
                size: 3,
                data: this.refGeometry.attributes.position.data
            },
            normal: {
                size: 3,
                data: this.refGeometry.attributes.normal.data
            }
        });

        this.blitDataProgram = new Program(this.gl, {
            vertex: blitDataVert,
            fragment: blitDataFrag,
            uniforms: {
                uSize: {value: this.SIZE}
            },
            depthTest: false,
            depthWrite: false
        })

        this.predictPositionsProgram = new Program(this.gl, {
            vertex: predictPositionsVert,
            fragment: predictPositionsFrag,
            uniforms: {
                tPositions: {value: this.solvedPositionsBuffer.read.texture},
                tVelocity: {value: this.velocityBuffer.texture},
                uGravity: {value: new Vec3(0, 9.8, 0)},
                uDt: {value: 1/120},
                uSize: {value: this.SIZE}
            },
            depthTest: false,
            depthWrite: false
        });

        this.solvePositionsProgram = new Program(this.gl, {
            vertex: solvePositionsVert,
            fragment: solvePositionsFrag,
            uniforms: {
                tPositions: {value: this.copyBuffer.texture},
                tInitPositions: {value: this.copyBuffer.texture},
                tPickedRestLengths: {value: new Texture(this.gl)},
                tInitRestLengths: {value: new Texture(this.gl)},
                uHitPoint: {value: this.hitPoint},
                uIsDragging: {value: 0},
                uPickedIndex: {value: -1},
                uSize: {value: this.SIZE}
            },
            depthTest: false,
            depthWrite: false
        });

        this.updateVelocityProgram = new Program(this.gl, {
            vertex: updateVelocityVert,
            fragment: updateVelocityFrag,
            uniforms: {
                tPosition: {value: this.solvedPositionsBuffer.read.texture},
                tPrevPosition: {value: this.positionBuffer.textures[0]},
                uSize: {value: this.SIZE},
                uDt: {value: 1/120},
                // uInertia: {value: 0.998}
                uInertia: {value: 0.997}
            },
            depthTest: false,
            depthWrite: false
        });

        //------------------------------------------------

        this.copyProgram = new Program(this.gl, {
            vertex: bigTriangle,
            fragment: copy,
            uniforms: {
                tMap: {value: new Texture(this.gl)}
            },
            depthTest: false,
            depthWrite: false
        });

        this.blitMesh = new Mesh(this.gl, {
            mode: this.gl.POINTS,
            geometry,
            program: this.copyProgram
        });

        this.blitQuad = new Mesh(this.gl, {
            geometry: copyGeo,
            program: this.copyProgram
        })

        this.blitPoint = new Mesh(this.gl, {
            mode: this.gl.POINTS,
            geometry: new Geometry(this.gl, {position: {size: 3, data: new Float32Array([0, 0, 0])}}),
            program: this.copyProgram
        })

        //shape matching stuff
        //------------------------------------------------

        this.relativePositionsProgram = new Program(this.gl, {
            vertex: calcRelativePositionsVert,
            fragment: calcRelativePositionsFrag,
            uniforms: {
                tPosition: {value: new Texture(this.gl)},
                tCenterOfMass: {value: new Texture(this.gl)},
                uSize: {value: this.SIZE}
            },
            depthTest: false,
            depthWrite: false
        });

        const sumShader = new Program(this.gl, {
            vertex: sumVert,
            fragment: sumFrag,
            uniforms: {
                tData: {value: new Texture(this.gl)},
                uSize: {value: this.SIZE}
            },
            depthTest: false,
            depthWrite: false,
            transparent: true,
        });

        if(!this.USE_REDUCTIONS) {
            sumShader.setBlendFunc(this.gl.ONE, this.gl.ONE, this.gl.ONE, this.gl.ONE);
            sumShader.setBlendEquation(this.gl.FUNC_ADD, this.gl.FUNC_ADD);
        }

        this.sumProgram = new Mesh(this.gl, {
            mode: this.gl.POINTS,
            geometry,
            program: sumShader
        })

        //here we will define the APQ matrix by summing
        //the relative positions and taking the outer product
        //of the original matrix
        this.calcMatrixAProgram = new Program(this.gl, {
            vertex: calcMatrixAVert,
            fragment: calcMatrixAFrag,
            uniforms: {
                tRelativePositions: {value: this.relativePositionsBuffer.texture},
                tInitRelativePositions: {value: this.initRelativePositionsBuffer.texture},
                uSize: {value: this.SIZE}
            }
        });

        //here we will calculate the ideal rotation, which will be a quaternion
        this.calcRotationProgram = new Program(this.gl, {
            vertex: calcRotationVert,
            fragment: calcRotationFrag,
            uniforms: {
                tAQQA: {value: this.AQQABuffer.texture},
                tAQQB: {value: this.AQQBBuffer.texture},
                tAQQC: {value: this.AQQCBuffer.texture},
                tAPQA: {value: this.APQABuffer.texture},
                tAPQB: {value: this.APQBBuffer.texture},
                tAPQC: {value: this.APQCBuffer.texture},
                tPrevRotation: {value: new Texture(this.gl)},
                uInitMatrix: {value: 1}
            },
            depthTest: false,
            depthWrite: false
        });
        this.applyGoalPositionsProgram = new Program(this.gl, {
            vertex: applyGoalPositionsVert,
            fragment: applyGoalPositionsFrag,
            uniforms: {
                tPositions: {value: this.positionBuffer.textures[1]},
                tInitRelativePositions: {value: this.initRelativePositionsBuffer.texture},
                tCenterOfMass: {value: this.centerOfMassBuffer.texture},
                tQuaternion: {value: this.finalRotationAndMatrixBuffer.textures[0]},
                tAPQAQQInvA: {value: this.finalRotationAndMatrixBuffer.textures[1]},
                tAPQAQQInvB: {value: this.finalRotationAndMatrixBuffer.textures[2]},
                tAPQAQQInvC: {value: this.finalRotationAndMatrixBuffer.textures[3]},
                uSize: {value: this.SIZE},
                uAlpha: {value: 0.0035},
                // uAlpha: {value: 0.1},
                uBeta: {value: 0.5},
                uDt: {value: 1/120}
            },
            depthTest: false,
            depthWrite: false
        });

        //and we need to rotate the normals as well
        this.updateNormalsProgram = new Program(this.gl, {
            vertex: updateNormalsVert,
            fragment: updateNormalsFrag,
            uniforms: {
                tInitNormals: {value: this.initPositionNormal.textures[1]},
                tQuaternion: {value: this.finalRotationAndMatrixBuffer.textures[0]},
                tAPQAQQInvA: {value: this.finalRotationAndMatrixBuffer.textures[1]},
                tAPQAQQInvB: {value: this.finalRotationAndMatrixBuffer.textures[2]},
                tAPQAQQInvC: {value: this.finalRotationAndMatrixBuffer.textures[3]},
                uSize: {value: this.SIZE},
                uBeta: {value: 0.5}
            },
            depthTest: false,
            depthWrite: false
        });

        //------------------------------------------------

        this.restLengthsProgram = new Program(this.gl, {
            vertex: calcRestLengthsVert,
            fragment: calcRestLengthsFrag,
            uniforms: {
                tPositions: {value: new Texture(this.gl)},
                tInitCenterOfMass: {value: new Texture(this.gl)},
                uSize: {value: this.SIZE}
            },
            depthTest: false,
            depthWrite: false
        });

        this.pickedRestLengthsProgram = new Program(this.gl, {
            vertex: calcPickedRestLengthsVert,
            fragment: calcPickedRestLengthsFrag,
            uniforms: {
                tPositions: {value: new Texture(this.gl)},
                uPickedIndex: {value: -1.0},
                uHitPoint: {value: new Vec3(999, 999, 999)},
                uSize: {value: this.SIZE}
            },
            depthTest: false,
            depthWrite: false
        });

    }
    //capture initial center of mass in order to determine the initial relative positions
    //which is required to calculate the AQQ matrix
    initShapeMatching() {

        //blit initial positions and normals
        this.blitMesh.program = this.blitDataProgram;
        this.gl.renderer.render({scene: this.blitMesh, target: this.initPositionNormal});

        this.blitQuad.program = this.copyProgram;
        this.blitQuad.program.uniforms['tMap'].value = this.initPositionNormal.textures[0];
        this.gl.renderer.render({scene: this.blitQuad, target: this.solvedPositionsBuffer.write});
        this.solvedPositionsBuffer.swap();

        //calc init center of mass
        this.initPositions = this.initPositionNormal.textures[0];
        this.initNormals = this.initPositionNormal.textures[1];
        this.sum({data: this.initPositions, target: this.initCenterOfMassBuffer});

        const currentProgram = this.blitMesh.program;
        this.blitMesh.program = this.restLengthsProgram;
        this.blitMesh.program.uniforms['tPositions'].value = this.initPositions;
        this.blitMesh.program.uniforms['tInitCenterOfMass'].value = this.initCenterOfMassBuffer.texture;
        this.gl.renderer.render({scene: this.blitMesh, target: this.restLenghtsBuffer})
        this.blitMesh.program = currentProgram;

        //calc init relative positions
        this.calcRelativePositions({
            positions: this.initPositions,
            centerOfMass: this.initCenterOfMassBuffer.texture,
            target: this.initRelativePositionsBuffer
        });

        //calc AQQ matrix
        this.generateAPQAQQMatrix({
            p: this.initRelativePositionsBuffer.texture,
            q: this.initRelativePositionsBuffer.texture,
            target: this.qqBuffer,
            matrixRows: [
                this.AQQABuffer,
                this.AQQBBuffer,
                this.AQQCBuffer,
            ]
        });

    }

    predictionPositions() {

        this.blitMesh.program = this.predictPositionsProgram;
        this.blitMesh.program.uniforms['tPositions'].value = this.solvedPositionsBuffer.read.texture;
        this.blitMesh.program.uniforms['uDt'].value = this.dt / this.SUBSTEPS;
        this.gl.renderer.render({scene: this.blitMesh, target: this.positionBuffer});

    }

    //render to single point of possible, use reductions otherwise
    //REMINDER: CLEAR THE ALPHA BEFORE RENDERING TO SINGLE POINT
    sum({data, target} = {}) {

        if(!this.USE_REDUCTIONS) {

            const clearColor = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);
            this.gl.clearColor(0, 0, 0, 0);

            this.sumProgram.program.uniforms['tData'].value = data;
            this.gl.renderer.render({scene: this.sumProgram, target});

            this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

            return;
        }

        for(let i = this.reductions.length - 1; i >= 0; i--) {

        }

    }

    calcRelativePositions({positions, centerOfMass, target} = {}) {
        this.blitMesh.program = this.relativePositionsProgram;
        this.blitMesh.program.uniforms['tPosition'].value = positions;
        this.blitMesh.program.uniforms['tCenterOfMass'].value = centerOfMass;
        this.gl.renderer.render({scene: this.blitMesh, target});
    }

    //REMINDER: CLEAR THE ALPHA BEFORE RENDERING TO SINGLE POINT
    generateAPQAQQMatrix({p, q, target, matrixRows}) {

        this.blitMesh.program = this.calcMatrixAProgram;
        this.blitMesh.program.uniforms['tRelativePositions'].value = p;
        this.blitMesh.program.uniforms['tInitRelativePositions'].value = q;
        this.gl.renderer.render({scene: this.blitMesh, target})

        if(!this.USE_REDUCTIONS) {

            // const autoClear = this.gl.renderer.autoClear;
            // this.gl.renderer.autoClear = false;

            this.sum({data: target.textures[0], target: matrixRows[0]})
            this.sum({data: target.textures[1], target: matrixRows[1]})
            this.sum({data: target.textures[2], target: matrixRows[2]})

            // this.gl.renderer.autoClear = autoClear;

            return;
        }

        for(let i = this.reductions.length - 1; i >= 0; i--) {

        }

    }

    calcRotation() {
        this.blitPoint.program = this.calcRotationProgram;

        this.blitPoint.program.uniforms['tAQQA'].value = this.AQQABuffer.texture;
        this.blitPoint.program.uniforms['tAQQB'].value = this.AQQBBuffer.texture;
        this.blitPoint.program.uniforms['tAQQC'].value = this.AQQCBuffer.texture;
        this.blitPoint.program.uniforms['tAPQA'].value = this.APQABuffer.texture;
        this.blitPoint.program.uniforms['tAPQB'].value = this.APQBBuffer.texture;
        this.blitPoint.program.uniforms['tAPQC'].value = this.APQCBuffer.texture;

        this.blitPoint.program.uniforms['tPrevRotation'].value = this.prevRotationBuffer.texture;
        this.blitPoint.program.uniforms['uInitMatrix'].value = this.firstMatrixCalc ? 1 : 0;

        this.gl.renderer.render({scene: this.blitPoint, target: this.finalRotationAndMatrixBuffer});

        this.firstMatrixCalc = false;

        this.blitQuad.program.uniforms['tMap'].value = this.finalRotationAndMatrixBuffer.textures[0];
        this.gl.renderer.render({scene: this.blitQuad, target: this.prevRotationBuffer});
    }

    applyGoalPositions() {

        this.blitMesh.program = this.applyGoalPositionsProgram;

        this.blitMesh.program.uniforms['tPositions'].value = this.positionBuffer.textures[1];
        this.blitMesh.program.uniforms['tInitRelativePositions'].value = this.initRelativePositionsBuffer.texture;
        this.blitMesh.program.uniforms['tCenterOfMass'].value = this.centerOfMassBuffer.texture;

        this.blitMesh.program.uniforms['tQuaternion'].value = this.finalRotationAndMatrixBuffer.textures[0];
        this.blitMesh.program.uniforms['tAPQAQQInvA'].value = this.finalRotationAndMatrixBuffer.textures[1];
        this.blitMesh.program.uniforms['tAPQAQQInvB'].value = this.finalRotationAndMatrixBuffer.textures[2];
        this.blitMesh.program.uniforms['tAPQAQQInvC'].value = this.finalRotationAndMatrixBuffer.textures[3];
        this.blitMesh.program.uniforms['uDt'].value = this.dt / this.SUBSTEPS;

        this.gl.renderer.render({scene: this.blitMesh, target: this.solvedPositionsBuffer.write});
        this.solvedPositionsBuffer.swap();

    }

    solvePositions() {
        this.blitMesh.program = this.solvePositionsProgram;
        this.blitMesh.program.uniforms['tPositions'].value = this.solvedPositionsBuffer.read.texture;
        this.blitMesh.program.uniforms['tInitPositions'].value = this.initPositions;
        this.blitMesh.program.uniforms['tInitRestLengths'].value = this.restLenghtsBuffer.texture;
        this.blitMesh.program.uniforms['tPickedRestLengths'].value = this.pickedRestLengthsBuffer.texture;
        this.blitMesh.program.uniforms['tPositions'].value = this.solvedPositionsBuffer.read.texture;
        // this.blitMesh.program.uniforms['uHitPoint'].value.copy(this.hitPoint);
        // this.blitMesh.program.uniforms['uIsDragging'].value = this.dragging ? 1 : 0;
        // this.blitMesh.program.uniforms['uPickedIndex'].value = this.dragging ? this.gpuPicker.result.w : - 1;
        this.gl.renderer.render({scene: this.blitMesh, target: this.solvedPositionsBuffer.write});
        this.solvedPositionsBuffer.swap();
    }

    updateVelocity() {
        this.blitMesh.program = this.updateVelocityProgram;
        this.blitMesh.program.uniforms['tPosition'].value = this.solvedPositionsBuffer.read.texture;
        this.blitMesh.program.uniforms['tPrevPosition'].value = this.positionBuffer.textures[0];
        this.blitMesh.program.uniforms['uDt'].value = this.dt / this.SUBSTEPS;
        this.gl.renderer.render({scene: this.blitMesh, target: this.velocityBuffer});
    }

    updateNormals() {
        this.blitMesh.program = this.updateNormalsProgram;
        this.blitMesh.program.uniforms['tInitNormals'].value = this.initNormals;
        this.blitMesh.program.uniforms['tQuaternion'].value = this.finalRotationAndMatrixBuffer.textures[0];
        this.blitMesh.program.uniforms['tAPQAQQInvA'].value = this.finalRotationAndMatrixBuffer.textures[1];
        this.blitMesh.program.uniforms['tAPQAQQInvB'].value = this.finalRotationAndMatrixBuffer.textures[2];
        this.blitMesh.program.uniforms['tAPQAQQInvC'].value = this.finalRotationAndMatrixBuffer.textures[3];

        this.gl.renderer.render({scene: this.blitMesh, target: this.normalBuffer});
    }

    blitHit() {
        if(this.hitBlitted) return;
        this.hitBlitted = true;

        const prevProgram = this.blitQuad.program;
        this.blitQuad.program = this.copyProgram;
        // this.blitQuad.program.uniforms['tMap'].value = this.positionBuffer.textures[1];
        this.blitQuad.program.uniforms['tMap'].value = this.solvedPositionsBuffer.read.texture
        this.gl.renderer.render({scene: this.blitQuad, target: this.copyBuffer});
        this.blitQuad.program = prevProgram;

        this.gpuPicker.pick({
            positions: this.copyBuffer.texture,
            rayOrigin: this.rayCaster.origin,
            rayDirection: this.rayCaster.direction,
            size: this.SIZE,
            worldMatrix: this.worldMatrix
        });

        this.updateHitPoint();

        const currentProgram = this.blitMesh.program;
        this.blitMesh.program = this.pickedRestLengthsProgram;

        this.blitMesh.program.uniforms['uHitPoint'].value.copy(this.localHitPoint);
        this.blitMesh.program.uniforms['tPositions'].value = this.copyBuffer.texture;
        this.blitMesh.program.uniforms['uPickedIndex'].value = this.gpuPicker.result.w;
        this.gl.renderer.render({scene: this.blitMesh, target: this.pickedRestLengthsBuffer});
        this.blitMesh.program = currentProgram;

        this.solvePositionsProgram.uniforms['uHitPoint'].value.copy(this.hitPoint);
        this.solvePositionsProgram.uniforms['uIsDragging'].value = this.dragging ? 1 : 0;
        console.log(this.gpuPicker.result.w);
        this.solvePositionsProgram.uniforms['uPickedIndex'].value = this.dragging ? this.gpuPicker.result.w : - 1;
    }

    update({time = 0, deltaTime = 0, worldMatrix} = {}) {

        // this.dt = 0.01;
        this.dt = deltaTime;
        this.worldMatrix.copy(worldMatrix)

        if(this.firstTick) {
            this.firstTick = false;
            this.initShapeMatching();
            return;
        }
        //TODO - test adding the gpu pick inside loop
        for(let i = 0; i < this.SUBSTEPS; i++) {

            this.predictionPositions();
            this.dragging && this.blitHit();

            //shape matching
            //-------------

            this.sum({data: this.positionBuffer.textures[1], target: this.centerOfMassBuffer}); //get center of mass
            this.calcRelativePositions({
                positions: this.positionBuffer.textures[1],
                centerOfMass: this.centerOfMassBuffer.texture,
                target: this.relativePositionsBuffer
            });

            this.generateAPQAQQMatrix({
                p: this.relativePositionsBuffer.texture,
                q: this.initRelativePositionsBuffer.texture,
                target: this.pqBuffer,
                matrixRows: [
                    this.APQABuffer,
                    this.APQBBuffer,
                    this.APQCBuffer,
                ]
            });

            this.calcRotation();
            this.applyGoalPositions();

            //-------------

            this.solvePositions();
            this.updateVelocity();
            this.updateNormals();

        }

    }

    get positions() { return this.solvedPositionsBuffer.read.texture;}
    get normals() { return this.normalBuffer.texture;}

    //init GPU picking
    addHandlers() {

        this.hitPoint = new Vec3();
        this.gpuPicker = new GpuPicker(this.gl, {
            geometry: this.refGeometry
        });
        this.rayCaster = new Raycast();
        addEventListener('pointerdown', this.handlePointerDown)
        addEventListener('pointermove', this.handlePointerMove)
        addEventListener('pointerup', this.handlePointerUp)

    }

    updateHitPoint(scale = 1) {
        this.localHitPoint = new Vec3(this.gpuPicker.result.x, this.gpuPicker.result.y, this.gpuPicker.result.z);
        const dist = new Vec3().sub(this.localHitPoint, this.rayCaster.origin).len() * 0.9;
        this.hitPoint = this.rayCaster.direction.clone().multiply(dist).add(this.rayCaster.origin);

    }

    handlePointerDown = (e) => {
        this.dragging = true;
        const _x = 2.0 * (e.x / window.innerWidth) - 1.0;
        const _y = 2.0 * (1.0 - (e.y / window.innerHeight)) - 1.0;
        this.rayCaster.castMouse(this.gl.camera, new Vec2(_x, _y));
        this.blitHit();
        this.initHitPoint = this.hitPoint.clone();
    }

    handlePointerMove = (e) => {
        if(!this.dragging) return;
        if(this.gpuPicker.result.w < 0.0) return;

        const _x = 2.0 * (e.x / window.innerWidth) - 1.0;
        const _y = 2.0 * (1.0 - (e.y / window.innerHeight)) - 1.0;
        this.rayCaster.castMouse(this.gl.camera, new Vec2(_x, _y));

        this.updateHitPoint();
        this.solvePositionsProgram.uniforms['uHitPoint'].value.copy(this.hitPoint);

    }

    handlePointerUp = (e) => {
        this.dragging = false;
        this.hitBlitted = false;
        this.solvePositionsProgram.uniforms['uIsDragging'].value = 0;
    }


}
