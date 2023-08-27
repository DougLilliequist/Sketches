import {RenderTarget, Vec3, Vec4, Geometry, Mesh, Program, Mat3, Mat4, Texture, Triangle} from "ogl";
import {HashGrid} from "$lib/sketches/softbody/utils/HashGrid.js";

import predictionPositionVert from './kernels/predictPosition.vert?raw';
import predictionPositionFrag from './kernels/predictPosition.frag?raw';

import solvePositionVert from './kernels/solvePosition.vert?raw';
import solvePositionFrag from './kernels/solvePosition.frag?raw';

import calcVolumeVert from './kernels/calcVolume.vert?raw';
import calcVolumeFrag from './kernels/calcVolume.frag?raw';

import calcVolumeConstraintsVert from './kernels/calcVolumeConstraints.vert?raw';
import calcVolumeConstraintsFrag from './kernels/calcVolumeConstraints.frag?raw';

import volumeConstraintsVert from './kernels/volumeConstraints.vert?raw';
import volumeConstraintsFrag from './kernels/volumeConstraints.frag?raw';

import applyVolumeConstraintsVert from './kernels/applyVolumeConstraints.vert?raw'
import applyVolumeConstraintsFrag from './kernels/applyVolumeConstraints.frag?raw'

import edgeConstraintsVert from './kernels/edgeConstraints.vert?raw';
import edgeConstraintsFrag from './kernels/edgeConstraints.frag?raw';

import applyEdgeConstraintsVert from './kernels/applyEdgeConstraints.vert?raw';
import applyEdgeConstraintsFrag from './kernels/applyEdgeConstraints.frag?raw';

import updateVelocityVert from './kernels/updateVelocity.vert?raw';
import updateVelocityFrag from './kernels/updateVelocity.frag?raw';

import copyDataVert from './kernels/copyData.vert?raw';
import copyDataFrag from './kernels/copyData.frag?raw';

//NOTE TO SELF: this GPU approach is more to challenge myself and
//validate if it makes sense to handle this sim on the GPU.
//my suspicion is that it will make more sense to compute the
//tet simulation on the CPU with a webworker, but utilise my learnings
//from wrinkle meshes and handle position skinning and normal calculation on the GPU
export default class SoftBodyMesh {
    constructor(gl, {simulationGeo, visualGeo, wrinkle = false} = {}) {

        if(!simulationGeo) return;
        if(!visualGeo) return;

        this.gl = gl;

        this.simulationGeo = simulationGeo;
        this.visualGeo = visualGeo;


        this.vertexCount = 0;
        this.tetraHedraCount = 0;
        this.skinningData = null;

        this.sizeSim = 2;
        this.sizeTet = 2;
        this.sizeVis = 2;

        //buffers

        this.positionBuffer = null; //MRT
        this.solvedPositionBuffer = null;
        this.velocityBuffer = null;
        this.normalBuffer = null;
        this.copyBuffer = null;

        this.outputPositionBuffer = null;
        this.restVolumes = null;
        this.inverseMasses = null;

        //MRT buffer which will contain all the volume constraint directions
        //that are rendered into individual buffers
        this.volumeConstraints = null; //MRT
        this.volumeConstraintA = null;
        this.volumeConstraintB = null;
        this.volumeConstraintC = null;
        this.volumeConstraintD = null;

        this.restVolumesData = null;
        this.volIdOrder = [[1,3,2], [0,2,3], [0,3,1], [0,1,2]];


        //single texture which contains all the edge corrections which
        //will be possible by addtive blending
        this.edgeConstraints = null;

        /////////

        this.ready = false;
        this.firstTick = true;

        this.NUM_SUBSTEPS = 1;
        this.dt = (1.0 / 120) / this.NUM_SUBSTEPS;

        //Consider making this class isolated in a sense that it only
        //handles the tetrahedral simulation, but accepts functions for
        //computing and returning barycentric coordinates for the visual mesh, which will also make it easier to set
        //a visual mesh to be a wrinkle mesh!
        this.initSimulationData().then(() => {
            this.initBuffers();
            this.initSimulationGeo();
            this.initTetrahedralDataPrograms();
            this.initEdgeConstraintProgram();
            this.initPrograms();
            // this.initVisualMesh();
        });

    }

    initSimulationData() {

        this.vertexCount = this.visualGeo.position.length / 3;
        this.tetCount = this.simulationGeo['tet_indices'].length / 4;
        this.skinningData = new Float32Array(this.vertexCount * 4);

        return new Promise((resolve, reject) => {
            this.initTetrahedralSkinning().then(() => {
                resolve();
            });
        })

    }

    //TODO: add link to Müllers demo which uses this method for getting barycentric coordinate inside tets
    initTetrahedralSkinning() {

        return new Promise((resolve, reject) => {
        // create a hash for all vertices of the visual mesh
        const tetPositions = this.simulationGeo.position;
        const tetIndicies = this.simulationGeo['tet_indices'];

        let hash = new HashGrid(0.05, this.vertexCount);
        hash.create(this.visualGeo.position);

        this.skinningData.fill(-1.0);		// undefined

        let minDist = new Float32Array(this.vertexCount);
        minDist.fill(Number.MAX_VALUE);
        let border = 0.05;

        // each tet searches for containing vertices

        let tetCenter = new Vec3();
        let mat = new Mat3();
        let bary3 = new Vec3();
        let bary = new Vec4();

        let tPos = new Vec3();

        let p0Pos = new Vec3();
        let p1Pos = new Vec3();
        let p2Pos = new Vec3();
        let p3Pos = new Vec3();

        let visPos = new Vec3();

        for (let i = 0; i < this.tetCount; i++) {

            // compute bounding sphere of tet

            tetCenter.scale(0);
            let tetIndex;
            let tX;
            let tY;
            let tZ;
            for (let j = 0; j < 4; j++) {
                tPos.scale(0);

                tetIndex = tetIndicies[4 * i + j];
                tX = tetPositions[tetIndex + 0];
                tY = tetPositions[tetIndex + 1];
                tZ = tetPositions[tetIndex + 2];

                tPos.set(tX, tY, tZ).scale(0.25);
                tetCenter.add(tPos)
            }

            let rMax = 0.0;
            for (let j = 0; j < 4; j++) {

                tPos.scale(0);

                tetIndex = tetIndicies[4 * i + j];
                tX = tetPositions[tetIndex + 0];
                tY = tetPositions[tetIndex + 1];
                tZ = tetPositions[tetIndex + 2];

                tPos.set(tX, tY, tZ).scale(0.25);

                let r2 = tetCenter.squaredDistance(tPos);
                rMax = Math.max(rMax, Math.sqrt(r2));
            }

            rMax += border;


            hash.query(tetCenter.toArray(), 0, rMax);
            if (hash.queryIds.length == 0)
                continue;


            let id0 = tetIndicies[4 * i];
            let id1 = tetIndicies[4 * i + 1];
            let id2 = tetIndicies[4 * i + 2];
            let id3 = tetIndicies[4 * i + 3];

            const p0x = tetPositions[id0 + 0];
            const p0y = tetPositions[id0 + 1];
            const p0z = tetPositions[id0 + 2];
            p0Pos.set(p0x, p0y, p0z);

            const p1x = tetPositions[id1 + 0];
            const p1y = tetPositions[id1 + 1];
            const p1z = tetPositions[id1 + 2];
            p1Pos.set(p1x, p1y, p1z);

            const p2x = tetPositions[id2 + 0];
            const p2y = tetPositions[id2 + 1];
            const p2z = tetPositions[id2 + 2];
            p2Pos.set(p2x, p2y, p2z);

            const p3x = tetPositions[id3 + 0];
            const p3y = tetPositions[id3 + 1];
            const p3z = tetPositions[id3 + 2];
            p3Pos.set(p3x, p3y, p3z);

            mat.set(
                p0Pos.x - p3Pos.x, p0Pos.y - p3Pos.y, p0Pos.z - p3Pos.z,
                p1Pos.x - p3Pos.x, p1Pos.y - p3Pos.y, p1Pos.z - p3Pos.z,
                p2Pos.x - p3Pos.x, p2Pos.y - p3Pos.y, p2Pos.z - p3Pos.z,
            )

            mat.inverse();


            for (let j = 0; j < hash.queryIds.length; j++) {
                let id = hash.queryIds[j];
                // we already have skinning info

                if (minDist[id] <= 0.0)
                    continue;

                visPos.x = this.visualGeo.position[id];
                visPos.y = this.visualGeo.position[id + 1];
                visPos.z = this.visualGeo.position[id + 2];
                let distSq = visPos.squaredDistance(tetCenter);

                if (distSq > rMax * rMax)
                    continue;

                // compute barycentric coords for candidate

                bary3.x = visPos.x - p3Pos.x;
                bary3.y = visPos.y - p3Pos.y;
                bary3.z = visPos.z - p3Pos.z;

                // vecSetDiff(bary,0, visVerts,id, this.pos, id3);
                bary3.applyMatrix3(mat);

                bary.x = bary3.x;
                bary.y = bary3.y;
                bary.z = bary3.z;
                bary.w = 1.0 - bary.x - bary.y - bary.z;

                let dist = 0.0;

                let bArry = bary.toArray();
                for (let k = 0; k < 4; k++)
                    dist = Math.max(dist, -bArry[k]);

                if (dist < minDist[id]) {
                    minDist[id] = dist;
                    this.skinningData[4 * id] = i;
                    this.skinningData[4 * id + 1] = bary.x;
                    this.skinningData[4 * id + 2] = bary.y;
                    this.skinningData[4 * id + 3] = bary.z;
                }
            }
        }
        resolve()
        })

    }

    initBuffers() {

        //buffers relevant for simulation mesh
        this.sizeSim = this.getSize(this.simulationGeo.position.length / 3)
        this.sizeTet = this.getSize(this.tetCount);
        this.sizeVis = this.getSize(this.vertexCount);

        //create MRT for position predicition (MRT)
        this.positionBuffer = this.createBuffer({w: this.sizeSim, h: this.sizeSim, numBuffers: 2})

        //create buffer for general constraint solver
        this.solvedPositionBuffer = this.createBuffer({w: this.sizeSim, h: this.sizeSim});

        //create buffer for edge constraints
        this.edgeConstraints = this.createBuffer({w: this.sizeSim, h: this.sizeSim});

        //create buffer for volume constraint solver (MRT)
        this.volumeConstraints = this.createBuffer({w: this.sizeTet, h: this.sizeTet, numBuffers: 4});

        //create buffer for rest volumes
        this.restVolumes = this.createBuffer({w: this.sizeTet, h: this.sizeTet});

        //create buffer for velocity update
        this.velocityBuffer = this.createBuffer({w: this.sizeSim, h: this.sizeSim});

        //create copy buffer
        this.copyBuffer = this.createBuffer({w: this.sizeSim, h: this.sizeSim});

        //create buffer for output positions (which are skinned based on simulation data)
        this.outputPositionBuffer = this.createBuffer({w: this.sizeVis, h: this.sizeVis});

        //create buffer for normal creation
        this.normalBuffer = this.createBuffer({w: this.sizeVis, h: this.sizeVis});

    }

    //geometry for reading position texture and defining the volume constraints
    initTetrahedralDataPrograms() {

        //init point geo for representing tetrahedral data and necessary summations
        const tetPositions = this.simulationGeo.position;
        const tetIndicies = this.simulationGeo['tet_indices'];
        this.inverseMasses = new Float32Array(tetPositions.length / 3);
        this.restVolumesData = new Float32Array(this.tetCount);

        const tetIndexData = [];
        const volIdData = [];

        const volumeConstraintApplyData = [];

        //iterate through each tetrahedron
        for(let i = 0; i < this.tetCount; i++) {
            let currentTetIndices = [];

            for (let j = 0; j < 4; j++) currentTetIndices.push(tetIndicies[4 * i + j]);

            //compute restVolume
            const va = new Vec3(tetPositions[currentTetIndices[0]], tetPositions[currentTetIndices[0] + 1], tetPositions[currentTetIndices[0] + 2]);
            const vb = new Vec3(tetPositions[currentTetIndices[1]], tetPositions[currentTetIndices[1] + 1], tetPositions[currentTetIndices[1] + 2]);
            const vc = new Vec3(tetPositions[currentTetIndices[2]], tetPositions[currentTetIndices[2] + 1], tetPositions[currentTetIndices[2] + 2]);
            const vd = new Vec3(tetPositions[currentTetIndices[3]], tetPositions[currentTetIndices[3] + 1], tetPositions[currentTetIndices[3] + 2]);

            const restVolume = this.computeVolume({va, vb, vc, vd});
            this.restVolumesData[i] = restVolume;

            //add inverse masses while wer'e at it...and store data to texture
            this.inverseMasses[currentTetIndices[0]] += restVolume > 0.0 ? (1.0 / (restVolume * 0.25)) : 0;
            this.inverseMasses[currentTetIndices[1]] += restVolume > 0.0 ? (1.0 / (restVolume * 0.25)) : 0;
            this.inverseMasses[currentTetIndices[2]] += restVolume > 0.0 ? (1.0 / (restVolume * 0.25)) : 0;
            this.inverseMasses[currentTetIndices[3]] += restVolume > 0.0 ? (1.0 / (restVolume * 0.25)) : 0;

            //push indicies according to id order for cross product calculation
            this.volIdOrder.forEach((order, i) => {
                order.forEach(index => {
                    volIdData.push(currentTetIndices[index])
                })
            })

            currentTetIndices.forEach(index => {
                tetIndexData.push(index);

                //create points containing the indicies in the tetrahedra
                volumeConstraintApplyData.push(index);

                //save the current tetrahedras index which will be needed to sample
                //the tetrahedra texture itself and apply the correct correction directions
                volumeConstraintApplyData.push(i);
            });

        }

        this.volumeConstraintGeo = new Geometry(this.gl, {
            indices: {
                data: new Float32Array(tetIndexData),
                size: 4
            },
            volumeIdOrder: {
                data: new Float32Array(volIdData),
                size: 3
            }
        });

        this.applyVolumeConstraintGeo = new Geometry(this.gl, {
            indices: {
                data: new Float32Array(volumeConstraintApplyData),
                size: 2
            },
        });

    }

    computeVolume({va, vb, vc, vd} = {}) {
        let a = new Vec3().sub(vb, va);
        let b = new Vec3().sub(vc, va);
        let c = new Vec3().sub(vd, va);
        let tmp = new Vec3().cross(a, b);
        const v = tmp.dot(c) / 6;
        return v
    }

    initSimulationGeo() {

        this.geo = new Geometry(this.gl, {
            position: {
                data: new Float32Array(this.simulationGeo.position),
                size: 3
            }
        });

    }

    //NOTE: I need to do a similar program for the normal generation
    //geometry for defining and calculating and summing all edge constraints for every given vertex/particle
    initEdgeConstraintProgram() {
        const tetPositions = this.simulationGeo.position;
        const tetIndicies = this.simulationGeo['tet_indices'];

        let vA = new Vec3();
        let vB = new Vec3();
        let delta = new Vec3();

        const data = [];

        //iterate through each tetrahedron
        for(let i = 0; i < this.tetCount; i++) {
            let currentTetIndices = [];

            //get indicies that make up current tetrahedron
            for (let j = 0; j < 4; j++) currentTetIndices.push(tetIndicies[4 * i + j]);

            //for each triangle in the current tet, define edge constraints
            for(let j = 0; j < this.volIdOrder.length; j++) {

                for(let k = 0; k < 3; k++) {

                    const iA = currentTetIndices[this.volIdOrder[j][k]]
                    const iB = currentTetIndices[this.volIdOrder[j][(k + 1) % 3]]
                    const iC = currentTetIndices[this.volIdOrder[j][(k + 2) % 3]]

                    data.push(iA);
                    data.push(iB);

                    //compute restLength
                    vA.set(tetPositions[iA], tetPositions[iA + 1], tetPositions[iA + 2])
                    vB.set(tetPositions[iB], tetPositions[iB + 1], tetPositions[iB + 2])
                    data.push(delta.sub(vA, vB).len());

                    data.push(iA);
                    data.push(iC);

                    vB.set(tetPositions[iC], tetPositions[iC + 1], tetPositions[iC + 2])
                    data.push(delta.sub(vA, vB).len());

                }

            }

        }

        this.edgeConstraintGeo = new Geometry(this.gl, {
            position: {
                data: new Float32Array(data),
                size: 3
            }
        });

    }

    initPrograms() {

        //create position predicition program
        const predictPositionShader = new Program(this.gl, {
            uniforms: {
              tPosition: {value: null},
              tVelocity: {value: null},
              uDeltaTime: {value: this.dt},
              uTextureSize: {value: this.sizeSim}
            },
            vertex: predictionPositionVert,
            fragment: predictionPositionFrag
        })

        this.predictPositionProgram = new Mesh(this.gl, {
            geometry: this.simulationGeo,
            program: predictPositionShader,
            mode: this.gl.POINTS
        });

        //create position solver program
        const solvePositionShader = new Program(this.gl, {
            uniforms: {
                tPredictedPositions: {value: null},
                uApplyInput: {value: 0.0},
                uTextureSize: {value: this.sizeSim}
            },
            vertex: solvePositionVert,
            fragment: solvePositionFrag
        })

        this.solvePositionProgram = new Mesh(this.gl, {
            geometry: this.simulationGeo,
            program: solvePositionShader,
            mode: this.gl.POINTS
        });

        //create volume calculation program
        const volumeCalcShader = new Program(this.gl, {
            uniforms: {
                tPositions: {value: null},
                uTextureSize: {value: this.sizeTet}
            },
            vertex: calcVolumeVert,
            fragment: calcVolumeFrag
        })

        this.volumeCalcProgram = new Mesh(this.gl, {
            geometry: this.volumeConstraintGeo,
            program: volumeCalcShader,
            mode: this.gl.POINTS
        });

        //create constraint direction calc program
        const calcVolumeConstraintShader = new Program(this.gl, {
            uniforms: {
                tPositions: {value: null},
                tMasses: {value: null},
                uTextureSizeSim: {value: this.sizeSim}
            },
            vertex: calcVolumeConstraintsVert,
            fragment: calcVolumeConstraintsFrag
        })

        this.calcVolumeConstraintProgram = new Mesh(this.gl, {
            geometry: this.volumeConstraintGeo,
            program: calcVolumeConstraintShader,
            mode: this.gl.POINTS
        });


        //create volume constraint calculation program
        const volumeConstraintShader = new Program(this.gl, {
            uniforms: {
                tPositions: {value: null},
                tMasses: {value: null},
                tVolumeConstraintDirA: {value: null},
                tVolumeConstraintDirB: {value: null},
                tVolumeConstraintDirC: {value: null},
                tVolumeConstraintDirD: {value: null},
                uDeltaTime: {value: this.dt},
                uTextureSizeTet: {value: this.sizeTet},
                uTextureSizeSim: {value: this.sizeSim}
            },
            vertex: volumeConstraintsVert,
            fragment: volumeConstraintsFrag,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            blendFunc: { src: this.gl.ONE, dst: this.gl.ONE }
        });

        this.volumeConstraintProgram = new Mesh(this.gl, {
            geometry: this.applyVolumeConstraintGeo,
            program: volumeConstraintShader,
            mode: this.gl.POINTS
        });

        //create volume constraint apply program
        const volumeConstraintApplyShader = new Program(this.gl, {
            uniforms: {
                tPositions: {value: null},
                tVolumeConstraints: {value: null},
                uTextureSizeSim: {value: this.sizeSim},
                uTextureSizeTet: {value: this.sizeTet},
            },
            vertex: applyVolumeConstraintsVert,
            fragment: applyVolumeConstraintsFrag,
        });

        this.volumeConstraintApplyProgram = new Mesh(this.gl, {
            geometry: this.simulationGeo,
            program: volumeConstraintApplyShader,
            mode: this.gl.POINTS
        });

        //create edge constraint calculation program
        const edgeConstraintShader = new Program(this.gl, {
            uniforms: {
                tPositions: {value: null},
                tMasses: {value: null},
                uDeltaTime: {value: this.dt},
                uTextureSizeSim: {value: this.sizeSim}
            },
            vertex: edgeConstraintsVert,
            fragment: edgeConstraintsFrag,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            blendFunc: { src: this.gl.ONE, dst: this.gl.ONE }
        });

        this.edgeConstraintProgram = new Mesh(this.gl, {
            geometry: this.edgeConstraintGeo,
            program: edgeConstraintShader,
            mode: this.gl.POINTS
        });

        //create edge constraint apply program
        const edgeConstraintApplyShader = new Program(this.gl, {
            uniforms: {
                tPositions: {value: null},
                tEdgeConstraints: {value: null},
                uTextureSize: {value: this.sizeSim}
            },
            vertex: applyEdgeConstraintsVert,
            fragment: applyEdgeConstraintsFrag
        })

        this.edgeConstraintApplyProgram = new Mesh(this.gl, {
            geometry: this.simulationGeo,
            program: edgeConstraintApplyShader,
            mode: this.gl.POINTS
        });

        //create velocity update program
        const velocityUpdateShader = new Program(this.gl, {
            uniforms: {
                tSolvedPositions: {value: null},
                tPrevPositions: {value: null},
                uDeltaTime: {value: this.dt},
                uTextureSize: {value: this.sizeSim}
            },
            vertex: updateVelocityVert,
            fragment: updateVelocityFrag
        })

        this.updateVelocityProgram = new Mesh(this.gl, {
            geometry: this.simulationGeo,
            program: velocityUpdateShader,
            mode: this.gl.POINTS
        });

        //create copy data program
        const copyDataShader = new Program(this.gl, {
            uniforms: {
                tMap: {value: null}
            },
            vertex: copyDataVert,
            fragment: copyDataFrag
        });

        this.copyDataProgram = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: copyDataShader
        });

        //create sumation program

    }

    //TODO: set up geometries for wrinkle mesh mode
    initVisualMesh() {

        //set up geometry needed for normal calculation

        //optional: set up edge constrain program when using wrinkle mesh mode

        // const normalCalcGeo

        const geo = new Geometry(this.gl, {
            position: {
                data: new Float32Array(this.visualGeo.position),
                size: 3
            },
            normal: {
                data: new Float32Array(this.visualGeo.normal),
                size: 3
            },
            uv: {
                data: new Float32Array(this.visualGeo.uv),
                size: 2
            },
            index: {
                data: new Uint16Array(this.visualGeo.index)
            }
        });

    }

    predictPositions() {

    }

    solvePositions() {
        this.solveVolumeConstraints();
        this.solveEdgeConstraints();
    }


    solveVolumeConstraints() {

    }

    solveEdgeConstraints() {

    }

    updateVelocity() {

    }

    //use information from tetrahedral mesh to skin the higher res mesh to the tetrahedral data
    //this also includes calculating surface normals on the fly by taking the cross product
    //of all the visual mesh's possible neighbours
    updatevisualGeo() {

    }

    preWarm() {

    }

    update() {
        if(!this.ready) return;
        if(this.firstTick) {
            this.preWarm();
            this.firstTick = false;
        }
        for(let i = 0; i < this.NUM_SUBSTEPS; i++) {
            this.predictPositions();
            this.solvePositions();
            this.updateVelocity();
        }

        this.updatevisualGeo();

    }

    addHandlers() {

    }

    getSize(s) {
        return Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(s))) / Math.LN2));
    }

    createDataTexture(data, s) {
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
            width: s,
            flipY: false,
        });
    }

    createBuffer({type, w, h, numBuffers = 1}) {

        const options = {
            width: w,
            height: h,
            type: type || this.gl.FLOAT || this.gl.HALF_FLOAT || this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA16F) : this.gl.RGBA,
            minFilter: this.gl.NEAREST,
            depth: false,
            unpackAlignment: 1,
        };

        if(numBuffers > 1) options.color = numBuffers;

        return new RenderTarget(this.gl, options);

    }

}
