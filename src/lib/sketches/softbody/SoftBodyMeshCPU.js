/*
Copyright 2022 Matthias Müller - Ten Minute Physics, https://www.youtube.com/channel/UCTG_vrRdKYfrpqCv_WV4eyA

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import {RenderTarget, Vec3, Vec4, Geometry, Mesh, Program, Mat3, Mat4, Texture, Triangle, Transform} from "ogl";
import {HashGrid} from "$lib/sketches/softbody/utils/HashGrid.js";

import tetMeshDataVert from './meshData/tetMeshData.vert?raw';
import tetMeshDataFrag from './meshData/tetMeshData.frag?raw';

import tetSkinningVert from './tetskinning/tetSkinning.vert?raw';
import tetSkinningFrag from './tetskinning/tetSkinning.frag?raw';

import normalCalcVert from './tetskinning/normalCalc.vert?raw';
import normalCalcFrag from './tetskinning/normalCalc.frag?raw';

import blitTetDataVert from './meshData/blitTetData.vert?raw';
import blitTetDataFrag from './meshData/blitTetData.frag?raw';

import outputMeshVert from './shaders/outputMesh.vert?raw';
import outputMeshFrag from './shaders/outputMesh.frag?raw';

export default class SoftBodyMeshCPU extends Transform{
    constructor(gl, {simulationGeo, visualGeo, data, wrinkle = false} = {}) {
        super();
        if(!simulationGeo) return;
        if(!visualGeo) return;

        this.gl = gl;

        //SIMULATION (CPU)
        this.simulationGeo = simulationGeo;
        this.barycentricData = data;
        console.log(this.simulationGeo);

        this.particleCount = this.simulationGeo.position.length / 3;
        this.vertexCount = 0;
        this.tetraHedraCount = 0;

        this.restVolumes = null;
        this.restLengths = null;
        this.inverseMasses = null;

        this.currentPositions = this.simulationGeo.position.slice();
        this.prevPositions = this.simulationGeo.position.slice();
        this.velocities = new Float32Array((this.simulationGeo.position.length)).fill(0);

        this.posA = new Vec3();
        this.posB = new Vec3();
        this.posC = new Vec3();
        this.posD = new Vec3();
        this.prevPos = new Vec3();
        this.vel = new Vec3();
        this.delta = new Vec3();

        this.volIdOrder = [[1,3,2], [0,2,3], [0,3,1], [0,1,2]];

        this.temp = [
            new Vec3(),
            new Vec3(),
            new Vec3(),
            new Vec3()
        ]

        this.correctionDirections = [
            new Vec3(),
            new Vec3(),
            new Vec3(),
            new Vec3(),
        ]

        //-----------------

        //VISUAL SKINNING (GPU)
        this.visualGeo = visualGeo;

        this.skinningData = null;
        this.skinningIndices = null;

        this.simMeshDataBuffer = null;
        this.outputPositionBuffer = null;
        this.outputNormalsBuffer = null;

        this.attachmentConstraintsBuffer = null;
        //single texture which contains all the edge corrections which
        //will be possible by addtive blending
        this.edgeConstraintsBuffer = null;

        //-----------------

        //buffers relevant for simulation mesh
        this.sizeSim = this.getSize(this.simulationGeo.position.length / 3)
        this.sizeVis = this.getSize(this.visualGeo.position.length / 3);
        console.log(this.sizeVis);

        this.ready = false;
        this.firstTick = true;

        this.NUM_SUBSTEPS = 5;
        // this.NUM_SUBSTEPS = 7;
       // this.NUM_SUBSTEPS = 4;
        this.dt = (1.0 / 120) / this.NUM_SUBSTEPS;

        //Consider making this class isolated in a sense that it only
        //handles the tetrahedral simulation, but accepts functions for
        //computing and returning barycentric coordinates for the visual mesh, which will also make it easier to set
        //a visual mesh to be a wrinkle mesh!
        this.initSimulationData().then(() => {
            this.initTetMesh();
            this.initTetRestConfig();
            this.initBuffers();
            this.initVisualMesh();

            // this.initEdgeConstraintProgram();
            // this.initPrograms();
            this.ready = true;
        });

    }

    initSimulationData() {

        this.tetCount = this.simulationGeo['tet_indices'].length / 4;
        this.vertexCount = this.visualGeo.position.length / 3;
        this.skinningData = new Float32Array(this.vertexCount * 4);
        this.skinningIndices = new Float32Array(this.vertexCount * 4);

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
                    this.skinningData[4 * id + 1] = bArry[0];
                    this.skinningData[4 * id + 2] = bArry[1];
                    this.skinningData[4 * id + 3] = bArry[2];

                }
            }
        }
        resolve()
        })

    }

    initTetMesh() {

        const geo = new Geometry(this.gl, {
            position: {
                data: new Float32Array(this.simulationGeo.position),
                size: 3
            }
        })

        const program = new Program(this.gl, {
            uniforms: {
                uTextureSize: {value: this.sizeSim}
            },
            vertex: tetMeshDataVert,
            fragment: tetMeshDataFrag,
        });

        this.tetMesh = new Mesh(this.gl, {
            geometry: geo,
            program,
            mode: this.gl.POINTS
        });

        // this.addChild(this.tetMesh);

    }

    initTetRestConfig() {

        //init point geo for representing tetrahedral data and necessary summations
        const tetPositions = this.simulationGeo.position;
        const tetIndicies = this.simulationGeo['tet_indices'];
        this.inverseMasses = new Float32Array(tetPositions.length / 3);
        this.restVolumes = new Float32Array(this.tetCount);
        this.restLengths = new Float32Array(this.simulationGeo['edge_indices'].length / 2);

        //iterate through each tetrahedron
        for(let i = 0; i < this.tetCount; i++) {
            let currentTetIndices = [];

            for (let j = 0; j < 4; j++) currentTetIndices.push(tetIndicies[4 * i + j]);

            //compute restVolume
            const va = new Vec3(tetPositions[currentTetIndices[0] * 3], tetPositions[currentTetIndices[0] * 3 + 1], tetPositions[currentTetIndices[0] * 3 + 2]);
            const vb = new Vec3(tetPositions[currentTetIndices[1] * 3], tetPositions[currentTetIndices[1] * 3 + 1], tetPositions[currentTetIndices[1] * 3 + 2]);
            const vc = new Vec3(tetPositions[currentTetIndices[2] * 3], tetPositions[currentTetIndices[2] * 3 + 1], tetPositions[currentTetIndices[2] * 3 + 2]);
            const vd = new Vec3(tetPositions[currentTetIndices[3] * 3], tetPositions[currentTetIndices[3] * 3 + 1], tetPositions[currentTetIndices[3] * 3 + 2]);

            const restVolume = this.computeVolume({va, vb, vc, vd});
            this.restVolumes[i] = restVolume;

            //add inverse masses while wer'e at it...and store data to texture
            this.inverseMasses[currentTetIndices[0]] += restVolume > 0.0 ? (1.0 / (restVolume * 0.25)) : 0;
            this.inverseMasses[currentTetIndices[1]] += restVolume > 0.0 ? (1.0 / (restVolume * 0.25)) : 0;
            this.inverseMasses[currentTetIndices[2]] += restVolume > 0.0 ? (1.0 / (restVolume * 0.25)) : 0;
            this.inverseMasses[currentTetIndices[3]] += restVolume > 0.0 ? (1.0 / (restVolume * 0.25)) : 0;

        }

        const pA = new Vec3();
        const pB = new Vec3();
        const delta = new Vec3();

        for(let i = 0; i < this.restLengths.length; i++) {
            const id0 = this.simulationGeo['edge_indices'][i * 2];
            const id1 = this.simulationGeo['edge_indices'][i * 2 + 1];

            pA.set(tetPositions[id0 * 3], tetPositions[id0 * 3 + 1],tetPositions[id0 * 3 + 2]);
            pB.set(tetPositions[id1 * 3], tetPositions[id1 * 3 + 1],tetPositions[id1 * 3 + 2]);
            delta.sub(pA, pB);
            this.restLengths[i] = delta.len();
        }

    }

    computeVolume({va, vb, vc, vd} = {}) {
        let a = new Vec3().sub(vb, va);
        let b = new Vec3().sub(vc, va);
        let c = new Vec3().sub(vd, va);
        let tmp = new Vec3().cross(a, b);
        const v = tmp.dot(c) / 6;
        return v
    }

    //NOTE: I need to do a similar program for the normal generation
    //geometry for defining and calculating and summing all edge constraints for every given vertex/particle

    //TODO: update blender script to extract triangle data
    initEdgeContraints() {
        const tetPositions = this.simulationGeo.position;
        const edgeIndices = this.simulationGeo['edge_indices'];

        let vA = new Vec3();
        let vB = new Vec3();
        let delta = new Vec3();

        let edgeData = [];

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


                    vA.set(tetPositions[iA], tetPositions[iA + 1], tetPositions[iA + 2])
                    vB.set(tetPositions[iB], tetPositions[iB + 1], tetPositions[iB + 2])

                    let restLen = delta.sub(vA, vB).len();
                    edgeData.push([iA, iB, restLen]);

                    vB.set(tetPositions[iC], tetPositions[iC + 1], tetPositions[iC + 2])

                    restLen = delta.sub(vA, vB).len();
                    edgeData.push([iA, iC, restLen]);

                }

            }

        }

        edgeData = edgeData.sort((a, b) => a[0] - b[0]);

    }

    initBuffers() {

        this.simMeshDataBuffer = this.createBuffer({w: this.sizeSim, h: this.sizeSim})

        this.copyBuffer = this.createBuffer({w: this.sizeSim, h: this.sizeSim});

        this.weightsBuffer = this.createBuffer({w: this.sizeVis, h: this.sizeVis});
        this.tetIndexBuffer = this.createBuffer({w: this.sizeVis, h: this.sizeVis});

        //create buffer for output positions (which are skinned based on simulation data)
        this.outputPositionBuffer = this.createBuffer({w: this.sizeVis, h: this.sizeVis});

        //create buffer for normal creation
        this.outputNormalsBuffer = this.createBuffer({w: this.sizeVis, h: this.sizeVis});

    }

    initPrograms() {

    }

    //TODO: set up geometries for wrinkle mesh mode
    initVisualMesh() {

        this.initAttachmentPointGeo();

        //set up geometry needed for normal calculation
        this.initNormalCalcGeo();

        //optional: set up edge constrain program when using wrinkle mesh mode

        // const normalCalcGeo

        const geometry = new Geometry(this.gl, {
            // position: {
            //     data: new Float32Array(this.visualGeo.position),
            //     size: 3
            // },
            // normal: {
            //     data: new Float32Array(this.visualGeo.normal),
            //     size: 3
            // },
            // uv: {
            //     data: new Float32Array(this.visualGeo.uv),
            //     size: 2
            // },
            index: {
                data: new Uint16Array(this.visualGeo.index)
            }
        });

        const program = new Program(this.gl, {
            uniforms: {
                tPosition: {
                    value: new Texture(this.gl)
                },
                tNormal: {
                    value: new Texture(this.gl)
                },
                tWeights: {
                    value: this.weightsBuffer.texture
                },
                tTetIndicies: {
                    value: this.tetIndexBuffer.texture
                },
                tMap: {
                    value: new Texture(this.gl)
                },
                uTextureSize: {
                    value: this.sizeVis
                },
                uTextureSizeSim: {
                    value: this.sizeSim
                }
            },
            vertex: outputMeshVert,
            fragment: outputMeshFrag,
        })

        this.mesh = new Mesh(this.gl, {
            geometry,
            program,
            // mode: this.gl.POINTS
        })

        this.addChild(this.mesh);

    }

    initAttachmentPointGeo() {

        const tetIndicies = this.simulationGeo['tet_indices'];
        const skinningIndices = [];
        const skinningWeights = [];

        let nr = 0;
        for (let i = 0; i < this.vertexCount; i++) {
            let tetNr = this.skinningData[nr++] * 4;
            if (tetNr < 0) {
                nr += 3;
                continue;
            }

            let b0 = this.skinningData[nr++];
            skinningWeights.push(b0)

            let b1 = this.skinningData[nr++];
            skinningWeights.push(b1)

            let b2 = this.skinningData[nr++];
            skinningWeights.push(b2)

            let b3 = 1.0 - b0 - b1 - b2;
            skinningWeights.push(b3)

            let id0 = tetIndicies[tetNr++];
            skinningIndices.push(id0);

            let id1 = tetIndicies[tetNr++];
            skinningIndices.push(id1);

            let id2 = tetIndicies[tetNr++];
            skinningIndices.push(id2);

            let id3 = tetIndicies[tetNr++];
            skinningIndices.push(id3);
        }

        const geometry = new Geometry(this.gl, {
            tetIndex: {
                data: new Float32Array(this.barycentricData['enclosing_tetra_indices']),
                size: 4
            },
            weights: {
                data: new Float32Array(this.barycentricData['barycentric_coords']),
                size: 4
            }
        })

        const program = new Program(this.gl, {
            uniforms: {
                tPosition: {
                    value: new Texture(this.gl)
                },
                tWeights: {
                    value: new Texture(this.gl)
                },
                tTetIndicies: {
                    value: new Texture(this.gl)
                },
                uTextureSizeSim: {
                    value: this.sizeSim
                },
                uTextureSizeVis: {
                    value: this.sizeVis
                }
            },
            vertex: tetSkinningVert,
            fragment: tetSkinningFrag,
            depthTest: false,
            depthWrite: false
        })

        this.attachmentPointsProgram = new Mesh(this.gl, {
            geometry,
            program,
            mode: this.gl.POINTS
        })

        this.blitTetDataProgram = new Mesh(this.gl, {
            geometry,
            program: new Program(this.gl, {
                uniforms: {
                    uTextureSize: {value: this.sizeVis},
                    uRenderWeights: {value: 0.0}
                },
                vertex: blitTetDataVert,
                fragment: blitTetDataFrag,
                depthTest: false,
                depthWrite: false
            }),
            mode: this.gl.POINTS
        })

        this.gl.renderer.render({scene: this.blitTetDataProgram, target: this.tetIndexBuffer});

        this.blitTetDataProgram.program.uniforms['uRenderWeights'].value = 1.0;
        this.gl.renderer.render({scene: this.blitTetDataProgram, target: this.weightsBuffer});

        this.attachmentPointsProgram.program.uniforms['tTetIndicies'].value = this.tetIndexBuffer.texture;
        this.attachmentPointsProgram.program.uniforms['tWeights'].value = this.weightsBuffer.texture;

    }

    initNormalCalcGeo() {

        //define triangles
        const triangleData = [];
        for (let i = 0; i < this.visualGeo.index.length / 3; i++) {
            const arr = [];
            arr.push(this.visualGeo.index[i * 3]);
            arr.push(this.visualGeo.index[i * 3 + 1]);
            arr.push(this.visualGeo.index[i * 3 + 2]);
            triangleData[i] = arr;
        }

        const normalData = [];
        //for each triangle...make the adjecancy list
        for (let i = 0; i < triangleData.length; i++) {
            for (let j = 0; j < 3; j++) {
                const i0 = triangleData[i][j];
                const i1 = triangleData[i][(j + 1) % 3];
                const i2 = triangleData[i][(j + 2) % 3];

                normalData.push(i0);
                normalData.push(i1);
                normalData.push(i2);
            }
        }

        const geometry = new Geometry(this.gl, {
            position: {
                data: new Float32Array(normalData),
                size: 3
            }
        });

        const program = new Program(this.gl, {
            uniforms: {
                tPosition: {
                    value: new Texture(this.gl)
                },
                uTextureSize: {
                    value: this.sizeVis
                }
            },
            vertex: normalCalcVert,
            fragment: normalCalcFrag,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blendEquation: {modeRGB:this.gl.FUNC_ADD},
            blendFunc: { src: this.gl.ONE, dst: this.gl.ONE }

        })

        this.normalCalcProgram = new Mesh(this.gl, {
            geometry,
            program,
            mode: this.gl.POINTS
        })

        console.log(this.normalCalcProgram);

    }

    preWarm() {

    }

    predictPositions() {

        for(let i = 0; i < this.particleCount; i++) {

            this.posA.set(this.currentPositions[i * 3], this.currentPositions[i * 3 + 1], this.currentPositions[i * 3 + 2]);

            this.prevPositions[i * 3] = this.currentPositions[i * 3];
            this.prevPositions[i * 3 + 1] = this.currentPositions[i * 3 + 1];
            this.prevPositions[i * 3 + 2] = this.currentPositions[i * 3 + 2];

            //velocity at given particle
            this.vel.set(this.velocities[i * 3], this.velocities[i * 3 + 1], this.velocities[i * 3 + 2]);

            //gravity
            const gravity = -9.8 * this.dt;
            this.vel.y += gravity;

            // this.vel.scale(this.dt);
            this.posA.y += this.vel.y * this.dt;

            this.currentPositions[i * 3] = this.posA.x;
            this.currentPositions[i * 3 + 1] = this.posA.y;
            this.currentPositions[i * 3 + 2] = this.posA.z;

             this.velocities[i * 3] = this.vel.x;
             this.velocities[i * 3 + 1] = this.vel.y;
             this.velocities[i * 3 + 2] = this.vel.z;

        }

    }

    solvePositions() {
        this.solveEnvironmentConstraints();
        this.solveEdgeConstraints(10, this.dt);
        this.solveVolumeConstraints(3000, this.dt);
    }

    solveEnvironmentConstraints() {

        for(let i = 0; i < this.particleCount; i++) {

            this.posA.set(this.currentPositions[i * 3], this.currentPositions[i * 3 + 1], this.currentPositions[i * 3 + 2]);

            //prevent mesh from falling into infinity
            if(this.posA.y < -0.5) this.posA.y = -0.5;

            this.currentPositions[i * 3] = this.posA.x;
            this.currentPositions[i * 3 + 1] = this.posA.y;
            this.currentPositions[i * 3 + 2] = this.posA.z;

        }

    }


    solveVolumeConstraints(compliance, dt) {
        let alpha = compliance / dt /dt;

        const tetIndicies = this.simulationGeo['tet_indices'];

        for (let i = 0; i < this.tetCount; i++) {
            let w = 0.0;

            for (let j = 0; j < 4; j++) {
                let id0 = tetIndicies[4 * i + this.volIdOrder[j][0]];
                let id1 = tetIndicies[4 * i + this.volIdOrder[j][1]];
                let id2 = tetIndicies[4 * i + this.volIdOrder[j][2]];

                const p0x = this.currentPositions[id0 * 3];
                const p0y = this.currentPositions[id0 * 3 + 1];
                const p0z = this.currentPositions[id0 * 3 + 2];
                this.posA.set(p0x, p0y, p0z);

                const p1x = this.currentPositions[id1 * 3];
                const p1y = this.currentPositions[id1 * 3 + 1];
                const p1z = this.currentPositions[id1 * 3 + 2];
                this.posB.set(p1x, p1y, p1z);

                const p2x = this.currentPositions[id2 * 3];
                const p2y = this.currentPositions[id2 * 3 + 1];
                const p2z = this.currentPositions[id2 * 3 + 2];
                this.posC.set(p2x, p2y, p2z);

                this.temp[0].sub(this.posB, this.posA);
                this.temp[1].sub(this.posC, this.posA);

                this.correctionDirections[j].cross(this.temp[0], this.temp[1]).scale(1.0 / 6.0);

                const len = this.correctionDirections[j].squaredLen();
                w += this.inverseMasses[tetIndicies[4 * i + j]] * len;
            }
            if (w == 0.0)
                continue;

            let currentTetIndices = [];

            for (let j = 0; j < 4; j++) currentTetIndices.push(tetIndicies[4 * i + j]);

            //compute restVolume
            this.posA.set(this.currentPositions[currentTetIndices[0] * 3], this.currentPositions[currentTetIndices[0] * 3 + 1], this.currentPositions[currentTetIndices[0] * 3 + 2]);
            this.posB.set(this.currentPositions[currentTetIndices[1] * 3], this.currentPositions[currentTetIndices[1] * 3 + 1], this.currentPositions[currentTetIndices[1] * 3 + 2]);
            this.posC.set(this.currentPositions[currentTetIndices[2] * 3], this.currentPositions[currentTetIndices[2] * 3 + 1], this.currentPositions[currentTetIndices[2] * 3 + 2]);
            this.posD.set(this.currentPositions[currentTetIndices[3] * 3], this.currentPositions[currentTetIndices[3] * 3 + 1], this.currentPositions[currentTetIndices[3] * 3 + 2]);
            let vol = this.computeVolume({va: this.posA, vb: this.posB, vc: this.posC, vd: this.posD});

            let restVol = this.restVolumes[i];
            let C = vol - restVol;

            let s = -C / (w + alpha);

            for (let j = 0; j < 4; j++) {
                let id = tetIndicies[4 * i + j];
                this.posA.set(this.currentPositions[id * 3], this.currentPositions[id * 3 + 1], this.currentPositions[id * 3 + 2]);
                this.correctionDirections[j].multiply(s * this.inverseMasses[id]);
                this.posA.add(this.correctionDirections[j]);

                this.currentPositions[id * 3] = this.posA.x;
                this.currentPositions[id * 3 + 1] = this.posA.y;
                this.currentPositions[id * 3 + 2] = this.posA.z;
            }
        }
    }

    solveEdgeConstraints(compliance, dt) {
        let alpha = compliance / dt /dt;
        const edgeIndices = this.simulationGeo['edge_indices'];

        for (let i = 0; i < this.restLengths.length; i++) {
            let id0 = edgeIndices[2 * i];
            let id1 = edgeIndices[2 * i + 1];
            let w0 = this.inverseMasses[id0];
            let w1 = this.inverseMasses[id1];
            let w = w0 + w1;
            if (w == 0.0)
                continue;

            const p0x = this.currentPositions[id0 * 3];
            const p0y = this.currentPositions[id0 * 3 + 1];
            const p0z = this.currentPositions[id0 * 3 + 2];
            this.posA.set(p0x, p0y, p0z);

            const p1x = this.currentPositions[id1 * 3];
            const p1y = this.currentPositions[id1 * 3 + 1];
            const p1z = this.currentPositions[id1 * 3 + 2];
            this.posB.set(p1x, p1y, p1z);

            this.correctionDirections[0].set(0,0,0);
            this.correctionDirections[0].sub(this.posA, this.posB);

            let len = this.correctionDirections[0].len();
            if (len == 0.0)
                continue;

            this.correctionDirections[0].scale(1.0 / len);
            let restLen = this.restLengths[i];
            let C = len - restLen;
            let s = -C / (w + alpha);

            this.correctionDirections[1].copy(this.correctionDirections[0]).scale(s * w0);
            this.correctionDirections[2].copy(this.correctionDirections[0]).scale(-s * w1);

            this.posA.add(this.correctionDirections[1]);
            this.posB.add(this.correctionDirections[2]);

            this.currentPositions[id0 * 3] = this.posA.x;
            this.currentPositions[id0 * 3 + 1] = this.posA.y;
            this.currentPositions[id0 * 3 + 2] = this.posA.z;

            this.currentPositions[id1 * 3] = this.posB.x;
            this.currentPositions[id1 * 3 + 1] = this.posB.y;
            this.currentPositions[id1 * 3 + 2] = this.posB.z;

        }
    }

    updateVelocity() {

        for(let i = 0; i < this.particleCount; i++) {

            if(this.inverseMasses[i] === 0)
                continue;

            this.posA.set(this.currentPositions[i * 3], this.currentPositions[i * 3 + 1], this.currentPositions[i * 3 + 2]);
            this.posB.set(this.prevPositions[i * 3], this.prevPositions[i * 3 + 1], this.prevPositions[i * 3 + 2]);

            //update velocity
            this.delta.sub(this.posA, this.posB).divide(this.dt);

            this.velocities[i * 3] = this.delta.x;
            this.velocities[i * 3 + 1] = this.delta.y;
            this.velocities[i * 3 + 2] = this.delta.z;

        }

    }

    updateTetMesh()
    {

        for(let i = 0; i < this.tetMesh.geometry.attributes.position.data.length; i++) {
            this.tetMesh.geometry.attributes.position.data[i] = this.currentPositions[i];
        }

        this.tetMesh.geometry.attributes.position.needsUpdate = true;
        // this.tetMesh.geometry.computeBoundingBox();

        this.gl.renderer.render({scene: this.tetMesh, target: this.simMeshDataBuffer});

    }

    //use information from tetrahedral mesh to skin the higher res mesh to the tetrahedral data
    //this also includes calculating surface normals on the fly by taking the cross product
    //of all the visual mesh's possible neighbours
    updatevisualGeo() {

        // console.log(this.simMeshDataBuffer)
        this.attachmentPointsProgram.program.uniforms['tPosition'].value = this.simMeshDataBuffer.texture;
        this.gl.renderer.render({scene: this.attachmentPointsProgram, target: this.outputPositionBuffer});

        this.normalCalcProgram.program.uniforms['tPosition'].value = this.outputPositionBuffer.texture;
        this.gl.renderer.render({scene: this.normalCalcProgram, target: this.outputNormalsBuffer});

        this.mesh.program.uniforms['tPosition'].value = this.outputPositionBuffer.texture;
        this.mesh.program.uniforms['tNormal'].value = this.outputNormalsBuffer.texture;

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

        this.updateTetMesh();
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
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
            minFilter: this.gl.NEAREST,
            depth: false,
            unpackAlignment: 1,
        };

        if(numBuffers > 1) options.color = numBuffers;

        return new RenderTarget(this.gl, options);

    }

}
