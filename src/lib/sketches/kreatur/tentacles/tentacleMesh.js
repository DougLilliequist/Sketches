import TentacleSimulator from "./tentacleSimulator.js";
import {Plane, Program, Mesh, Texture, Geometry, Vec2, Camera, Shadow} from "ogl";

import vertex from './shaders/tentacleShader.vs.glsl?raw';
import fragment from './shaders/tentacleShader.fs.glsl?raw';

import vertexTest from './shaders/tentacleTest.vs.glsl?raw';
import fragmentTest from './shaders/tentacleTest.fs.glsl?raw';

import vertexShadow from './shaders/tentacleShaderShadow.vs.glsl?raw';
import fragmentShadow from './shaders/tentacleShaderShadow.fs.glsl?raw';

export default class TentacleMesh extends Mesh {
    constructor(gl, {rootPositions, resolutionCount, tentacleResolution = 5} = {}) {
        super(gl);
        this.gl = gl;

        this.rootPositions = rootPositions;
        this.resolutionCount = resolutionCount;

        this.tentacleResolution = tentacleResolution;

        this.data = new TentacleSimulator(this.gl, {rootPositions, resolutionCount});
        this.initCylinder();
        this.initShadowPass()

    }

    initCylinder() {

        const vertexCount = this.resolutionCount.y * this.resolutionCount.x * this.tentacleResolution;

        //note: no need for normals as they will be derived when calculating the local vertices
        const positionData = new Float32Array(vertexCount * 4);
        const uvData = new Float32Array(vertexCount * 2);
        const data = new Float32Array(vertexCount * 4);

        const TAU = Math.PI * 2;

        let positionDataIterator = 0;
        let uvDataIterator = 0;
        let dataIterator = 0;

        //iterate through each tentacle..
        for(let y = 0; y < this.resolutionCount.y; y++) {

            const dataA = Math.random();
            const dataB = Math.random();
            const dataC = Math.random();
            const dataD = Math.random();

            //iterate through each segment..
            for(let x = 0; x < this.resolutionCount.x; x++) {

                const phase = x / Math.max(1.0, (this.resolutionCount.x - 1));

                //generate vertices around each segment...
                for(let i = 0; i < this.tentacleResolution; i++) {

                    const angle = (i / this.tentacleResolution) * TAU;
                    positionData[positionDataIterator++] = angle;
                    positionData[positionDataIterator++] = x;
                    positionData[positionDataIterator++] = (x + 0.5) / this.resolutionCount.x;
                    positionData[positionDataIterator++] = (y + 0.5) / this.resolutionCount.y;

                    data[dataIterator++] = dataA;
                    data[dataIterator++] = dataB;
                    data[dataIterator++] = dataC;
                    data[dataIterator++] = dataD;

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

            let tentacleStartIndex = y * (this.resolutionCount.x) * this.tentacleResolution;
            let index = 0;

            for(let x = 0; x < this.resolutionCount.x - 1; x++) {
                for(let i = 0; i < this.tentacleResolution - 1; i++) {

                    indexData[indexDataIterator++] = tentacleStartIndex + index + 1;
                    indexData[indexDataIterator++] = tentacleStartIndex + index + this.tentacleResolution + 1;
                    indexData[indexDataIterator++] = tentacleStartIndex + index;

                    indexData[indexDataIterator++] = tentacleStartIndex + index + this.tentacleResolution + 1;
                    indexData[indexDataIterator++] = tentacleStartIndex + index + this.tentacleResolution;
                    indexData[indexDataIterator++] = tentacleStartIndex + index;

                    index++;

                }

                indexData[indexDataIterator++] = (tentacleStartIndex + index + 1) - this.tentacleResolution;
                indexData[indexDataIterator++] = tentacleStartIndex + index + 1;
                indexData[indexDataIterator++] = tentacleStartIndex + index;

                indexData[indexDataIterator++] = tentacleStartIndex + index + 1;
                indexData[indexDataIterator++] = tentacleStartIndex + index + this.tentacleResolution;
                indexData[indexDataIterator++] = tentacleStartIndex + index;

                index++;

            }

        }

        this.geometry = new Geometry(this.gl, {
            position: {
                size: 4,
                data: positionData
            },
            uv: {
                size: 2,
                data: uvData
            },
            data: {
                size: 4,
                data: data
            },
            index: {
                data: indexData
            }
        });

        const matcap = this.loadTexture('./src/lib/sketches/kreatur/assets/steel.jpg');
        const tentacleColors = this.loadTexture('./src/lib/sketches/kreatur/assets/tentacleColors2.png')
        const blueNoise = this.loadTexture('./src/lib/sketches/kreatur/assets/bluenoise256.png');
        blueNoise.wrapS = this.gl.REPEAT;
        blueNoise.wrapT = this.gl.REPEAT;
        blueNoise.minFilter = this.gl.NEAREST;
        blueNoise.magFilter = this.gl.NEAREST;

        this.program = new Program(this.gl, {
            uniforms: {
                tPosition: {
                    value: new Texture(this.gl)
                },
                tTangent: {
                    value: new Texture(this.gl)
                },
                tVelocity: {
                    value: new Texture(this.gl)
                },
                tBlueNoise: {
                    value: blueNoise
                },
                uRadius: {
                    value: 0.05
                },
                uTexelSize: {
                    value: new Vec2(1.0/this.resolutionCount.x, 1.0/this.resolutionCount.y)
                },
                tMatMap: {
                    value: matcap
                },
                tColors: {
                    value: tentacleColors
                },
                uShadowTexelSize: {
                    value: 1.0/1024
                },
                uTime: {
                    value: 0
                }
            },
            vertex,
            fragment,
            cullFace: null
        });

    }

    initShadowPass() {

        this.shadowCamera = new Camera(this.gl, {
            near: 1.0,
            far: 300.0,
            left: -5.5,
            right: 5.5,
            top: 5.5,
            bottom: -5.5
        });

        this.shadowCamera.position.set(0.0, 10.0, 0.0);
        this.shadowCamera.lookAt([0.0, 0.0, 0.0]);

        this.shadowPass = new Shadow(this.gl, {light: this.shadowCamera, width: 1024, height: 1024});
        this.shadowPass.add({mesh: this, vertex: vertexShadow, fragment: fragmentShadow});
        this.depthProgram.uniforms.tPosition = {value: this.data.positions};
        this.depthProgram.uniforms.tTangent = {value: this.data.tangents};
        this.depthProgram.uniforms.uRadius = {value: this.program.uniforms.uRadius.value};
        this.depthProgram.uniforms.uTexelSize = {value: this.program.uniforms.uTexelSize.value};

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

    loadTexture(src) {

        const img = new Image();
        img.crossOrigin = "*";
        img.src = src;

        const texture = new Texture(this.gl, {
            generateMipMaps: true
        });

        img.onload = () => texture.image = img;

        return texture;

    }

    update({inputPos = null, interacting = false, rootPositions = null, bodyPos} = {}) {

        this.data.update({inputPos, interacting, rootPositions, bodyPos});
        this.shadowPass.render({scene: this})
        this.program.uniforms.tPosition.value = this.data.positions;
        this.program.uniforms.tTangent.value = this.data.tangents;
        this.program.uniforms.tVelocity.value = this.data.velocities;
        this.program.uniforms.uTime.value += 0.001;

    }

}
