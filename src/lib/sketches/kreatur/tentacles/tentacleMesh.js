import TentacleSimulator from "./tentacleSimulator.js";
import {Plane, Program, Mesh, Texture, Geometry, Vec2} from "ogl";

import vertex from './shaders/tentacleShader.vs.glsl?raw';
import fragment from './shaders/tentacleShader.fs.glsl?raw';

import vertexTest from './shaders/tentacleTest.vs.glsl?raw';
import fragmentTest from './shaders/tentacleTest.fs.glsl?raw';

export default class TentacleMesh extends Mesh {
    constructor(gl, {rootPositions, resolutionCount, tentacleResolution = 5} = {}) {
        super(gl);
        this.gl = gl;

        this.rootPositions = rootPositions;
        this.resolutionCount = resolutionCount;

        this.tentacleResolution = tentacleResolution;

        this.data = new TentacleSimulator(this.gl, {rootPositions, resolutionCount});
        this.initCylinder();

    }

    initCylinder() {

        const vertexCount = this.resolutionCount.x * this.tentacleResolution;

        //note: no need for normals as they will be derived when calculating the local vertices
        const positionData = new Float32Array(this.resolutionCount.y * vertexCount * 4);
        const uvData = new Float32Array(this.resolutionCount.y * vertexCount * 2);

        const TAU = Math.PI * 2;

        let positionDataIterator = 0;
        let uvDataIterator = 0;

        //iterate through each tentacle..
        for(let y = 0; y < this.resolutionCount.y; y++) {

            //iterate through each segment..
            for(let x = 0; x < this.resolutionCount.x; x++) {

                const phase = x / (this.resolutionCount.x - 1);

                //generate vertices around each segment...
                for(let i = 0; i < this.tentacleResolution; i++) {

                    const angle = (i / this.tentacleResolution) * TAU;
                    positionData[positionDataIterator++] = angle;
                    positionData[positionDataIterator++] = x;
                    positionData[positionDataIterator++] = (x + 0.5) / this.resolutionCount.x;
                    positionData[positionDataIterator++] = (y + 0.5) / this.resolutionCount.y;

                    uvData[uvDataIterator++] = phase;
                    uvData[uvDataIterator++] = angle / TAU;

                }
            }

        }

        //generate indicies...
        const indexedVertexCount = this.resolutionCount.y * (this.resolutionCount.x - 1) * this.tentacleResolution * 6;

        const indexData = new Uint32Array(indexedVertexCount);
        let indexDataIterator = 0;

        for(let y = 0; y < this.resolutionCount.y; y++) {

            let indexOffset = y * this.resolutionCount.x * this.tentacleResolution;

            for(let x = 0; x < this.resolutionCount.x - 1; x++) {

                let segmentOffset = (x * (this.tentacleResolution - 1)) + indexOffset;

                let segmentIndexOffset = 0;

                for(let i = 0; i < this.tentacleResolution - 1; i++) {

                    indexData[indexDataIterator++] = segmentOffset + i + 1;
                    indexData[indexDataIterator++] = segmentOffset + i + this.tentacleResolution + 1;
                    indexData[indexDataIterator++] = segmentOffset + i;

                    indexData[indexDataIterator++] = segmentOffset + i + this.tentacleResolution + 1;
                    indexData[indexDataIterator++] = segmentOffset + i + this.tentacleResolution;
                    indexData[indexDataIterator++] = segmentOffset + i;

                    segmentIndexOffset++;

                }

                indexData[indexDataIterator++] = segmentOffset + this.tentacleResolution - (segmentIndexOffset + 1);
                indexData[indexDataIterator++] = segmentOffset + segmentIndexOffset + 1;
                indexData[indexDataIterator++] = segmentOffset + segmentIndexOffset;

                indexData[indexDataIterator++] = segmentOffset + segmentIndexOffset + 1;
                indexData[indexDataIterator++] = segmentOffset + segmentIndexOffset + this.tentacleResolution;
                indexData[indexDataIterator++] = segmentOffset + segmentIndexOffset;

            }

        }

        console.log(indexData);

        this.geometry = new Geometry(this.gl, {
            position: {
                size: 4,
                data: positionData
            },
            uv: {
                size: 2,
                data: uvData
            },
            index: {
                data: indexData
            }
        });

        this.program = new Program(this.gl, {
            uniforms: {
                tPosition: {
                    value: new Texture(this.gl)
                },
                tTangent: {
                    value: new Texture(this.gl)
                },
                uRadius: {
                    value: 0.03
                },
                uTexelSize: {
                    value: new Vec2(1.0/this.resolutionCount.x, 1.0/this.resolutionCount.y)
                }
            },
            vertex,
            fragment,
            cullFace: null
        });

    }

    initDebug() {
        const positionData = new Float32Array(this.resolutionCount.x * this.resolutionCount.y * 3)
        const uvData = new Float32Array(this.resolutionCount.x * this.resolutionCount.y * 2);

        let uvDataIterator = 0;

        // for(let i = 0; i < resolutionCount.x*resolutionCount.y; i++) {
        for(let i = 0; i < this.resolutionCount.y; i++) {
            for(let j = 0; j < this.resolutionCount.x; j++) {
                // let x = ((i % resolutionCount.x) + 0.5) / resolutionCount.x;
                // let y = (Math.floor(i / resolutionCount.y) + 0.5) / resolutionCount.y;

                let x = (j + 0.5) / this.resolutionCount.x;
                let y = (i + 0.5) / this.resolutionCount.y;

                uvData[uvDataIterator++] = x;
                uvData[uvDataIterator++] = y;
            }
        }

        this.geometry = new Geometry(this.gl, {
            position: {
                size: 3,
                data: positionData
            },
            uv: {
                size: 2,
                data: uvData
            }
        });

        this.program = new Program(this.gl, {
            vertex: vertexTest,
            fragment: fragmentTest,
            uniforms: {
                tPosition: {
                    value: new Texture(this.gl)
                },
                tTangent: {
                    value: new Texture(this.gl)
                }
            },
            cullFace: null
        });

        this.mode = this.gl.POINTS;
    }

    update({inputPos = null, interacting = false, rootPositions = null, bodyPos} = {}) {

        this.data.update({inputPos, interacting, rootPositions, bodyPos});
        this.program.uniforms.tPosition.value = this.data.positions;
        this.program.uniforms.tTangent.value = this.data.tangents;

    }

}
