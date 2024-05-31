import {RenderTarget, Plane, Program, Texture, Mesh, Vec2, Vec3, Triangle, Raycast, Mat4} from "ogl";

import screenQuad from './shaders/screenQuad.vs.glsl?raw';
import copyDataFS from './shaders/copyData.fs.glsl?raw';
import predictPosition from './shaders/predictPosition.fs.glsl?raw';
import solvePositions from './shaders/solvePositions.glsl?raw';
import updateVelocity from './shaders/updateVelocity.fs.glsl?raw';
import computeNormals from './shaders/computeNormals.fs.glsl?raw';
import restLength from './shaders/restLength.fs.glsl?raw';
import restLengthDiagonal from './shaders/diagonalRestLength.fs.glsl?raw';
import pullConstraints from './shaders/pullConstraints.fs.glsl?raw'
import {GpuPicker} from "$lib/sketches/cloth/clothmesh/gpupicker/GpuPicker.js";
import calcPickedRestLengthsVert
    from "./shaders/calcPickedRestLengths.vert?raw";
import calcPickedRestLengthsFrag
    from "./shaders/calcPickedRestLengths.frag?raw";

export default class ClothSimulator {
    constructor(gl, {resolution = new Vec2(64, 64), geometry, camera} = {}) {
        this.gl = gl;
        this.camera = camera;

        this.refGeo = geometry;
        this.firstRender = true;
        this.segmentCount = new Vec2().copy(resolution);
        this.subStepCount = 5.0 // 6;
        const dt = 1/120
        this.deltaTime = dt;
        this.restLength = new Vec2((1.0/this.segmentCount.x) * 1.0, (1.0/this.segmentCount.y) * 1.0);
        this.diagonalRestLength = this.restLength.len();

        this.worldMatrix = new Mat4().identity();
        this.hitPoint = new Vec3(999, 999, 999);
        this.localHitPoint = new Vec3(999, 999, 999);
        this.initHitPoint = new Vec3(999, 999 ,999);
        this.dragging = false;
        this.hitBlitted = false;
        this.inertia = 0.9997;
        this.targetInertia = 0.9997;

        this.initTextures();
        this.initPrograms();
        this.addHandlers();
    }

    initTextures() {

        const initPositionData = new Float32Array(this.segmentCount.x * this.segmentCount.y * 4);
        let initPositionIterator = 0;

        for(let y = 0; y < this.segmentCount.y; y++) {

            let phaseY = 2.0 * (y / (this.segmentCount.y - 1.0)) - 1.0;

            for(let x = 0; x < this.segmentCount.x; x++) {

                let phaseX = 2.0 * (x / (this.segmentCount.x - 1.0)) - 1.0;

                initPositionData[initPositionIterator++] = phaseX * 2.0;
                initPositionData[initPositionIterator++] = phaseY * 2.0;
                initPositionData[initPositionIterator++] = 0;
                initPositionData[initPositionIterator++] = 1.0;

            }
        }

        this.initPosition = this.createDataTexture({data: initPositionData, size: this.segmentCount.x});

        const initVelocityData = new Float32Array(this.segmentCount.x * this.segmentCount.y * 4);

        let initVelocityIterator = 0;

        for(let y = 0; y < this.segmentCount.y; y++) {
            for(let x = 0; x < this.segmentCount.x; x++) {
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) * 0.0;
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) * 0.0;
                initVelocityData[initVelocityIterator++] = (Math.random() * 2.0 - 1.0) * 0.0;
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
            internalFormat: this.gl.RGBA32F,
            minFilter: this.gl.NEAREST,
            depth: false,
            unpackAlignment: 1,
        };

        this.positionBuffer = new RenderTarget(this.gl, options);
        this.prevPositionBuffer = new RenderTarget(this.gl, options);
        this.solvedPositionBuffer = new RenderTarget(this.gl, options);
        this.velocityBuffer = new RenderTarget(this.gl, options);
        this.normalsBuffer = new RenderTarget(this.gl, options);
        this.restLengths = new RenderTarget(this.gl, options);
        this.restLengthsDiagonal = new RenderTarget(this.gl, options);
        this.pickedRestLengthsBuffer = new RenderTarget(this.gl, options);
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
                uInitSeed: {value: new Vec3(Math.random(), Math.random(), Math.random())},
                tNormal: {value: this.normalsBuffer.texture},
                uDeltaTime: {value: this.deltaTime / this.subStepCount},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)},
                uIsDragging: {value: 0.0},
                uHitPoint: {value: new Vec3(0, 0,0)}
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

        const pullConstraintsShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: pullConstraints,
            uniforms: {
                tPosition: {value: null},
                tPickedRestLengths: {value: new Texture(this.gl)},
                tNormal: {value: new Texture(this.gl)},
                uPickedIndex: {value: -1},
                uIsDragging: {value: 0.0},
                uDeltaTime: {value: this.deltaTime},
                uHitPoint: {value: new Vec3(0.0, 0.0, 0.0)},
            },
        });

        this.pullConstraintsProgram = new Mesh(this.gl, {
            geometry,
            program: pullConstraintsShader
        })

        const solvePositionsShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: solvePositions,
            uniforms: {
                tPosition: {value: null},
                tPickedRestLengths: {value: new Texture(this.gl)},
                tRestLength: {value: new Texture(this.gl)},
                tRestLengthDiagonal: {value: new Texture(this.gl)},
                uRestLength: {value: this.restLength},
                uDiagonalRestLength: {value: this.diagonalRestLength},
                uStiffness: {value: 0.5},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)},
                uDeltaTime: {value: this.deltaTime / this.subStepCount},
                uPickedIndex: {value: -1},
                uIsDragging: {value: 0.0},
                uHitPoint: {value: new Vec3(0.0, 0.0, 0.0)},
                uConstrainDiagonal: {value: 0.0}
            },
        });

        this.solvePositionsProgram = new Mesh(this.gl, {geometry, program: solvePositionsShader});

        const updateVelocityShader = new Program(this.gl, {
            vertex: screenQuad,
            fragment: updateVelocity,
            uniforms: {
                tPosition: {value: null},
                tPrevPosition: {value: null},
                uDeltaTime: {value: this.deltaTime / this.subStepCount},
                uTexelSize: {value: new Vec2(1.0 / this.segmentCount.x, 1.0/this.segmentCount.y)},
                uInertia: {value: 0.99997}
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

        const pickedRestLengthsShader = new Program(this.gl, {
            vertex: calcPickedRestLengthsVert,
            fragment: calcPickedRestLengthsFrag,
            uniforms: {
                tPositions: {value: new Texture(this.gl)},
                uPickedIndex: {value: -1.0},
                uHitPoint: {value: new Vec3(999, 999, 999)},
                uSize: {value: 256}
            },
            depthTest: false,
            depthWrite: false
        });

        this.calcPickedRestLengthsProgram = new Mesh(this.gl, {
            mode: this.gl.POINTS,
            geometry: this.refGeo,
            program: pickedRestLengthsShader
        });

    }

    preWarm() {
        this.copyDataProgram.program.uniforms.tData.value = this.initPosition;
        this.gl.renderer.render({scene: this.copyDataProgram, target: this.solvedPositionBuffer});

        this.restlengthProgram.program.uniforms.tPosition.value = this.solvedPositionBuffer.texture;
        this.restlengthDiagonalProgram.program.uniforms.tPosition.value = this.solvedPositionBuffer.texture;
        this.gl.renderer.render({scene: this.restlengthProgram, target: this.restLengths});
        this.gl.renderer.render({scene: this.restlengthDiagonalProgram, target: this.restLengthsDiagonal});

        this.solvePositionsProgram.program.uniforms.tRestLength.value = this.restLengths.texture;
        this.solvePositionsProgram.program.uniforms.tRestLengthDiagonal.value = this.restLengthsDiagonal.texture;

        this.copyDataProgram.program.uniforms.tData.value = this.initVelocity;
        this.gl.renderer.render({scene: this.copyDataProgram, target: this.velocityBuffer});
    }

    predictPositions({time, inputPos, interacting} = {}) {

        this.predictPositionProgram.program.uniforms.tVelocity.value = this.velocityBuffer.texture;
        this.predictPositionProgram.program.uniforms.tNormal.value = this.normalsBuffer.texture;
        this.predictPositionProgram.program.uniforms.tPosition.value = this.solvedPositionBuffer.texture;
        this.predictPositionProgram.program.uniforms.uTime.value = time * 0.001;
        this.predictPositionProgram.program.uniforms.uDeltaTime.value = this.deltaTime;
        this.gl.renderer.render({scene: this.predictPositionProgram, target: this.positionBuffer});

    }

    blitHit() {
        if(this.hitBlitted) return;
        this.hitBlitted = true;

        this.gpuPicker.pick({
            positions: this.solvedPositionBuffer.texture,
            rayOrigin: this.rayCaster.origin,
            rayDirection: this.rayCaster.direction,
            size: this.segmentCount.x,
            worldMatrix: this.worldMatrix,
            camera: this.camera
        });

        if(this.gpuPicker.result.w < 0) return;
        this.updateHitPoint();
        this.initHitPoint = this.hitPoint.clone();

        this.calcPickedRestLengthsProgram.program.uniforms['uHitPoint'].value.copy(this.hitPoint);
        this.calcPickedRestLengthsProgram.program.uniforms['tPositions'].value = this.copyBuffer.texture;
        this.calcPickedRestLengthsProgram.program.uniforms['uPickedIndex'].value = this.gpuPicker.result.w;
        this.gl.renderer.render({scene: this.calcPickedRestLengthsProgram, target: this.pickedRestLengthsBuffer});

        this.pullConstraintsProgram.program.uniforms['uHitPoint'].value.copy(this.hitPoint);
        this.pullConstraintsProgram.program.uniforms['uIsDragging'].value = this.dragging ? 1 : 0;
        this.pullConstraintsProgram.program.uniforms['uPickedIndex'].value = this.dragging ? this.gpuPicker.result.w : - 1;
    }

    solvePullConstraints({positions, normals}) {
        this.pullConstraintsProgram.program.uniforms.tPosition.value = positions?.texture;
        this.pullConstraintsProgram.program.uniforms.tNormal.value = normals?.texture;
        this.pullConstraintsProgram.program.uniforms.tPickedRestLengths.value = this.pickedRestLengthsBuffer.texture;
        this.pullConstraintsProgram.program.uniforms.uDeltaTime.value = this.deltaTime;
        this.gl.renderer.render({scene: this.pullConstraintsProgram, target: this.solvedPositionBuffer});
    }

    solveConstraints({positions, inputPos, interacting, direction}) {

        this.solvePositionsProgram.program.uniforms.tPosition.value = positions?.texture;
        this.solvePositionsProgram.program.uniforms.tPickedRestLengths.value = this.pickedRestLengthsBuffer.texture;
        this.solvePositionsProgram.program.uniforms.uDeltaTime.value = this.deltaTime
        this.solvePositionsProgram.program.uniforms.uConstrainDiagonal.value = direction;
        this.gl.renderer.render({scene: this.solvePositionsProgram, target: this.solvedPositionBuffer});

    }

    updateVelocity() {

        this.updateVelocityProgram.program.uniforms.tPosition.value = this.solvedPositionBuffer.texture;
        this.updateVelocityProgram.program.uniforms.tPrevPosition.value = this.prevPositionBuffer.texture;
        this.updateVelocityProgram.program.uniforms.uDeltaTime.value = this.deltaTime;
        this.targetInertia = ((this.gpuPicker.result.w > -1) && this.dragging) ? 0.998 : 0.9999;
        this.inertia += (this.targetInertia - this.inertia) * 0.1;

        this.updateVelocityProgram.program.uniforms.uInertia.value = this.inertia;
        this.gl.renderer.render({scene: this.updateVelocityProgram, target: this.velocityBuffer});

    }

    computeNormals() {

        this.normalsProgram.program.uniforms.tPosition.value = this.solvedPositionBuffer.texture;
        this.gl.renderer.render({scene: this.normalsProgram, target: this.normalsBuffer});

    }

    update({time, deltaTime, inputPos, interacting} = {}) {

        if(this.firstRender) {
            this.firstRender = false;
            this.preWarm();
            this.computeNormals();
            return;
        }

        this.deltaTime = deltaTime / this.subStepCount;
        this.dragging && this.blitHit();
        //save previous position
        for(let i = 0; i < this.subStepCount; i++) {
            this.copyDataProgram.program.uniforms.tData.value = this.solvedPositionBuffer.texture;
            this.gl.renderer.render({scene: this.copyDataProgram, target: this.prevPositionBuffer});
            this.predictPositions({time, inputPos, interacting});

            this.copyDataProgram.program.uniforms.tData.value = this.positionBuffer.texture;
            this.gl.renderer.render({scene: this.copyDataProgram, target: this.copyBuffer});
            this.solvePullConstraints({positions: this.copyBuffer, normals: this.normalsBuffer});

            for(let j = 0; j < 10; j++) {
                this.copyDataProgram.program.uniforms.tData.value = this.solvedPositionBuffer.texture;
                this.gl.renderer.render({scene: this.copyDataProgram, target: this.copyBuffer});
                this.solveConstraints({positions: this.copyBuffer, inputPos, interacting, direction: 0});
            }

            this.updateVelocity();
            this.computeNormals();
        }
    }

    updateHitPoint(scale = 1) {
        this.localHitPoint = new Vec3(this.gpuPicker.result.x, this.gpuPicker.result.y, this.gpuPicker.result.z);
        const dist = new Vec3().sub(this.localHitPoint, this.rayCaster.origin).len();
        this.hitPoint = this.rayCaster.direction.clone().multiply(dist).add(this.rayCaster.origin);
    }

    addHandlers() {

        this.rayCaster = new Raycast();

        this.gpuPicker = new GpuPicker(this.gl, {
            geometry: this.refGeo
        });

        addEventListener('pointerdown', this.handlePointerDown)
        addEventListener('pointermove', this.handlePointerMove)
        addEventListener('pointerup', this.handlePointerUp)

    }

    handlePointerDown = (e) => {
        this.dragging = true;
        const _x = 2.0 * (e.x / window.innerWidth) - 1.0;
        const _y = 2.0 * (1.0 - (e.y / window.innerHeight)) - 1.0;
        this.rayCaster.castMouse(this.camera, new Vec2(_x, _y));
    }

    handlePointerMove = (e) => {
        if(!this.dragging) return;
        if(this.gpuPicker.result.w < 0.0) return;

        const _x = 2.0 * (e.x / window.innerWidth) - 1.0;
        const _y = 2.0 * (1.0 - (e.y / window.innerHeight)) - 1.0;
        this.rayCaster.castMouse(this.camera, new Vec2(_x, _y));

        this.updateHitPoint();
        this.pullConstraintsProgram.program.uniforms['uHitPoint'].value.copy(this.hitPoint);

    }

    handlePointerUp = (e) => {
        this.dragging = false;
        this.hitBlitted = false;
        this.pullConstraintsProgram.program.uniforms['uIsDragging'].value = 0;
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
        return this.solvedPositionBuffer.texture;
    }

    get normals() {
        return this.normalsBuffer.texture;
    }

    // get restLengths() {
    //     return this.pickedRestLengthsBuffer.texture
    // }

}
