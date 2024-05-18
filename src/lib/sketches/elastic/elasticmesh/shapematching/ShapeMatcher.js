import {Geometry, Program, RenderTarget, Triangle, Mesh, Texture, Vec3} from "ogl";

import bigTriangle from './shaders/bigTriangle.vert?raw';
import copy from './shaders/copy.glsl?raw';

export class ShapeMatcher {
    constructor(gl, {
        geometry = null
    } = {}) {

        /**
         * TODO:
         *
         * - extract vertex positions and normals from geometry
         * - create shader function that will map all the meshes vertices
         * to 2D positions based on vertex ID
         * - create programs for
         *  - position prediction
         *  - center of mass calculation (summation)
         *  - relative position calculation
         *  - matrix creation (AQQ and APQ)
         *  - rotation matrix creation (refer to Müllers paper)
         *  - Goal position application
         *  - constraint application
         *  - velocity update
         *  - normal rotations
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
        const {position, normal, index} = this.refGeometry.attributes;

        this.SIZE = Math.pow(2, Math.ceil(Math.log2(Math.ceil(Math.sqrt(position.count)))));
        this.REDUCTION_STEPS = Math.floor(Math.log2(this.SIZE));
        this.USE_REDUCTIONS = true;

        this.SUBSTEPS = 4;
        this.firstTick = true;

        this.initBuffers();
        this.initShapeMatchingBuffers();
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
        this.initPositionBuffer = new RenderTarget(this.gl, options);
        this.initNormalsBuffer = new RenderTarget(this.gl, options);

        const posBufferOptions = Object.assign({}, options);
        posBufferOptions.color = 2;

        //attachments:
        // - 0: predicted position
        // - 1: previous position
        this.positionBuffer = new RenderTarget(this.gl, posBufferOptions);
        this.solvedPositionsBuffer = new RenderTarget(this.gl, options);

        this.normalBuffer = new RenderTarget(this.gl, options);
        this.velocityBuffer = new RenderTarget(this.gl, options);

        const restLengthOptions = Object.assign({}, options);
        restLengthOptions.format = this.gl.RED;
        restLengthOptions.internalFormat = this.gl.R32F;

        //buffer containing rest lengths between the picked particle
        //and all other particles
        this.pickedRestLengths = new RenderTarget(this.gl, restLengthOptions);

        //initial rest lengths to make the mesh stick in place
        this.restlenghts = new RenderTarget(this.gl, restLengthOptions);

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

        //AQQ buffer
        //each attachment represents one matrix row
        //EDIT: because the matrix rotation method does not rely on the initial matrix...I might not need this...
        this.AQQBuffer = new RenderTarget(this.gl, matrixBufferOptions);

        //APQ buffer
        //same as the AQQ buffer, each attachment represents one matrix row
        this.APQBuffer = new RenderTarget(this.gl, matrixBufferOptions);

        //buffer containing the matrix rows that contains
        //the resulting matrix that will be applied to the goal positions

        const finalMatrixOptions = Object.assign({}, singlePixelOptions);
        finalMatrixOptions.color = 4;

        this.finalMatrixBuffer = new RenderTarget(this.gl, finalMatrixOptions);

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
            }
        });

        this.predictPositionsProgram = new Program(this.gl, {});
        this.solvePositionsProgram = new Program(this.gl, {});
        this.updateVelocityProgram = new Program(this.gl, {});

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
            program: this.predictPositionsProgram
        });

        this.blitQuad = new Mesh(this.gl, {
            geometry: copyGeo,
            program: this.copyProgram
        })

        this.blitPoint = new Mesh(this.gl, {
            mode: this.gl.POINTS,
            geometry: new Geometry(this.gl, {position: {size: 3, data: new Float32Array[0, 0, 0]}}),
            program: this.copyProgram
        })

        //shape matching stuff
        //------------------------------------------------

        this.relativePositionsProgram = new Program(this.gl, {});
        this.centerOfMassProgram = new Program(this.gl, {
            blendEquation: {modeRGB:this.gl.FUNC_ADD, modeAlpha: this.gl.FUNC_ADD},
            blendFunc: { src: this.gl.ONE, dst: this.gl.ONE }
        });

        if(!this.USE_REDUCTIONS) {
            // this.centerOfMassProgram.setBlendFunc(this.gl.ONE, this.gl.ONE, this.gl.ONE, this.gl.ONE);
            this.centerOfMassProgram.setBlendEquation(this.gl.FUNC_ADD, this.gl.FUNC_ADD);
        }

        //here we will define the APQ matrix by summing
        //the relative positions and taking the outer product
        //of the original matrix
        this.calcAPQMatrixProgram = new Program(this.gl, {});

        //here we will calculate the ideal rotation, which will be a quaternion
        this.calcRotationProgram = new Program(this.gl, {});
        this.applyGoalPositionsProgram = new Program(this.gl, {});

        //and we need to rotate the normals as well
        this.updateNormalsProgram = new Program(this.gl, {});

        //------------------------------------------------

        this.restLengthsProgram = new Program(this.gl, {});
        this.pickedRestLengthsProgram = new Program(this.gl, {});

    }

    //init GPU picking
    addHandlers() {

        this.hitPoint = new Vec3();

    }

    //capture initial center of mass in order to determine the initial relative positions
    //which is required to calculate the AQQ matrix
    initShapeMatching() {

    }

    predictionPositions() {

        //use previously solved positions as input for
        //predicting positions

        this.blitMesh.program = this.predictPositionsProgram;

    }

    //render to single point of possible, use reductions otherwise
    //REMINDER: CLEAR THE ALPHA BEFORE RENDERING TO SINGLE POINT
    calcCenterOfMass() {

        if(!this.USE_REDUCTIONS) {
            this.blitMesh.program = this.centerOfMassProgram;
            return;
        }

        for(let i = this.reductions.length - 1; i >= 0; i--) {

        }

    }

    calcRelativePositions() {
        this.blitMesh.program = this.relativePositionsProgram;
    }

    //REMINDER: CLEAR THE ALPHA BEFORE RENDERING TO SINGLE POINT
    generateAPQMatrix() {

        if(!this.USE_REDUCTIONS) {
            this.blitMesh = this.calcAPQMatrixProgram;
            return;
        }

        for(let i = this.reductions.length - 1; i >= 0; i--) {

        }

    }

    calcRotation() {
        this.blitPoint.program = this.calcRotationProgram;
    }

    applyGoalPositions() {
        this.blitMesh.program = this.applyGoalPositionsProgram;
    }

    solvePositions() {
        this.blitMesh.program = this.solvePositionsProgram;
        //copy predicted positions and render to solved positions buffer
    }

    updateVelocity() {
        this.blitMesh.program = this.updateVelocityProgram;
    }

    updateNormals() {
        this.blitMesh.program = this.updateNormalsProgram;
    }

    update({time = 0, deltaTime = 0} = {}) {

        if(this.firstTick) {
            this.firstTick = false;
            this.initShapeMatching();
            return;
        }

        for(let i = 0; i < this.SUBSTEPS; i++) {

            this.predictionPositions();

            //shape matching
            //-------------
            this.calcCenterOfMass();
            this.calcRelativePositions();
            this.generateAPQMatrix();
            this.calcRotation();
            this.applyGoalPositions();
            //-------------

            this.solvePositions();
            this.updateVelocity();
            this.updateNormals();

        }

    }

    get positions() { return this.positionBuffer.textures[0];}

    get normals() { return this.normalBuffer.texture;}

}
