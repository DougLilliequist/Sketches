import {Box, Geometry, Mesh, Vec3, Program} from "ogl";
import vertex from './shader/vertex.vert?raw';
import fragment from './shader/fragment.frag?raw';

export default class AlienConstructMesh extends Mesh {

    constructor(gl) {
        super(gl);

        this.gl = gl;
        this.resolution = 13;
        this.initGeometry();
        this.initProgram();

    }

    initGeometry() {

        console.log('CREATE GEOMETRY')

        const refGeomtry = new Box(this.gl, {width: 1, height: 1, depth: 1});
        const {position, normal, index} = refGeomtry.attributes;

        const worldPositionData = new Float32Array(this.resolution * 3);
        const normalAxisData = new Float32Array(this.resolution * 3);
        const biNormalAxisData = new Float32Array(this.resolution * 3);
        const tangentAxisData = new Float32Array(this.resolution * 3);
        const paramsData = new Float32Array(this.resolution * 3);

        let worldPositionDataIterator = 0;
        let normalAxisDataIterator = 0;
        let biNormalAxisDataIteraot = 0;
        let tangentAxisDataIterator = 0;
        let paramsDataIterator = 0;

        let normalAxis = new Vec3();
        let biNormalAxis = new Vec3();
        let tangentAxis = new Vec3();

        let tau = Math.PI * 2.0;

        for(let i = 0; i < this.resolution; i++) {

            let phase = i / (this.resolution);

            let posX = Math.cos(phase * tau);
            let posY = Math.sin(phase * tau);
            let posZ = 0.0;

            normalAxis.set(posX, posY, posZ).normalize();
            tangentAxis.set(-posY, posX, posZ).normalize();
            biNormalAxis.copy(tangentAxis).cross(normalAxis).normalize();

            worldPositionData[worldPositionDataIterator++] = posX;
            worldPositionData[worldPositionDataIterator++] = posY;
            worldPositionData[worldPositionDataIterator++] = posZ;

            normalAxisData[normalAxisDataIterator++] = normalAxis.x;
            normalAxisData[normalAxisDataIterator++] = normalAxis.y;
            normalAxisData[normalAxisDataIterator++] = normalAxis.z;

            biNormalAxisData[biNormalAxisDataIteraot++] = biNormalAxis.x;
            biNormalAxisData[biNormalAxisDataIteraot++] = biNormalAxis.y;
            biNormalAxisData[biNormalAxisDataIteraot++] = biNormalAxis.z;

            tangentAxisData[tangentAxisDataIterator++] = tangentAxis.x;
            tangentAxisData[tangentAxisDataIterator++] = tangentAxis.y;
            tangentAxisData[tangentAxisDataIterator++] = tangentAxis.z;

            paramsData[paramsDataIterator++] = phase;
            paramsData[paramsDataIterator++] = 0.0;
            paramsData[paramsDataIterator++] = 0.0;

        }

        this.geometry = new Geometry(this.gl, {

            position: {
                data: position.data,
                size: 3
            },
            normal: {
                data: normal.data,
                size: 3
            },
            worldPosition: {
                instanced: 1,
                data: worldPositionData,
                size: 3
            },
            normalAxis: {
                instanced: 1,
                data: normalAxisData,
                size: 3
            },
            biNormalAxis: {
                instanced: 1,
                data: biNormalAxisData,
                size: 3
            },
            tangentAxis: {
                instanced: 1,
                data: tangentAxisData,
                size: 3
            },
            params: {
                instanced: 1,
                data: paramsData,
                size: 3
            },
            index: {
                data: index.data
            }

        });


    }

    initProgram() {

        const uniforms = {

            _Radius: {
                value: 1.0
            },
            _LocalRotationSpeed: {
                value: 0.1
            },
            _RotationSpeed: {
                value: 0.1
            },
            _OscilationSpeed: {
                value: 0.0
            },
            _Time: {
                value: 0
            }

        }

        this.program = new Program(this.gl, {
            uniforms,
            vertex,
            fragment,
            cullFace: null
        })

    }

    update({dt}) {

        this.program.uniforms._Time.value += dt;

    }

}
