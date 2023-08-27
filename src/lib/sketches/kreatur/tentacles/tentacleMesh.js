import TentacleSimulator from "./tentacleSimulator.js";
import {Plane, Program, Mesh, Texture, Geometry} from "ogl";

import vertex from './shaders/tentacleTest.vs.glsl?raw';
import fragment from './shaders/tentacleTest.fs.glsl?raw';

export default class TentacleMesh extends Mesh {
    constructor(gl, {rootPositions, resolutionCount}) {
        super(gl);
        this.gl = gl;
        // this.geometry = new Plane(this.gl, {width: 1, height: 1, widthSegments: resolutionCount.x, heightSegments: resolutionCount.y});
        let tick = 0;
        const positionData = new Float32Array(resolutionCount.x * resolutionCount.y * 3)
        const uvData = new Float32Array(resolutionCount.x * resolutionCount.y * 2);

        let uvDataIterator = 0;

        // for(let i = 0; i < resolutionCount.x*resolutionCount.y; i++) {
        for(let i = 0; i < resolutionCount.y; i++) {
            for(let j = 0; j < resolutionCount.x; j++) {
                // let x = ((i % resolutionCount.x) + 0.5) / resolutionCount.x;
                // let y = (Math.floor(i / resolutionCount.y) + 0.5) / resolutionCount.y;

                let x = (j + 0.5) / resolutionCount.x;
                let y = (i + 0.5) / resolutionCount.y;

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

        this.data = new TentacleSimulator(this.gl, {rootPositions, resolutionCount});
        this.program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                tPosition: {
                    value: new Texture(this.gl)
                },
                tNormal: {
                    value: new Texture(this.gl)
                }
            },
            cullFace: null
        });

        this.mode = this.gl.POINTS;

    }

    update({inputPos = null, interacting = false, rootPositions = null, bodyPos} = {}) {

        this.data.update({inputPos, interacting, rootPositions, bodyPos});
        this.program.uniforms.tPosition.value = this.data.position;
        this.program.uniforms.tNormal.value = this.data.normals;

    }

}
