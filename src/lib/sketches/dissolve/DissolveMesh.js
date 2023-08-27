import {Geometry, GLTFLoader, Mesh, Program, Sphere, Vec3} from "ogl";
import vertex from './dissolveMesh.vert?raw';
import fragment from './dissolveMesh.frag?raw';


export default class DissolveMesh extends Mesh {
    constructor(gl) {
        super(gl)
        this.ready = false;
        this.gl = gl;
        this.init();
    }

    async init() {
        // this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/matrix/assets/head2.gltf');
        //
        // //yuck...
        // const {meshes} = this.gltf;
        // let [meshPrimitives] = meshes;
        // const {primitives} = meshPrimitives;
        // let [mesh] = primitives;
        //
        // const refGeometry = mesh.geometry;
        // console.log(refGeometry);

        const refGeometry = new Sphere(this.gl, {
            widthSegments: 64,
            heightSegments: 64
        });

        //"manually" create indexed mesh
        const indices = refGeometry.attributes.index.data.slice();
        const {position, normal, uv} = refGeometry.attributes;

        const positionData = [];
        const centroidData = [];
        const faceNormalData = [];
        const normalData = [];
        const triangleID = [];
        const uvData = [];

        let indexCount = indices.length;
        let triangleCount = indices.length / 3;

        let indexData = [];

        for(let i = 0; i < indexCount; i++) {

            let iX = indices[i] * 3;
            let iY = indices[i] * 3 + 1;
            let iZ = indices[i] * 3 + 2;

            const pX = position.data[iX];
            const pY = position.data[iY];
            const pZ = position.data[iZ];

            const p1 = new Vec3(pX, pY, pZ);

            positionData.push(p1.x);
            positionData.push(p1.y);
            positionData.push(p1.z);

            const nX = normal.data[iX];
            const nY = normal.data[iY];
            const nZ = normal.data[iZ];

            const n1 = new Vec3(nX, nY, nZ);

            normalData.push(n1.x);
            normalData.push(n1.y);
            normalData.push(n1.z);

            const uX = uv.data[iX];
            const uY = uv.data[iY];

            uvData.push(uX);
            uvData.push(uY);

        }

        let triangleIterator = 0;
        //compute centers and face normals
        for(let i = 0; i < indexCount; i+=3) {

            let iX = indices[i] * 3;
            let iY = indices[i] * 3 + 1;
            let iZ = indices[i] * 3 + 2;

            //first vertex
            const pX = position.data[iX];
            const pY = position.data[iY];
            const pZ = position.data[iZ];

            //second vertex
            let i2X = indices[i + 1] * 3;
            let i2Y = indices[i + 1] * 3 + 1;
            let i2Z = indices[i + 1] * 3 + 2;

            const p2X = position.data[i2X];
            const p2Y = position.data[i2Y];
            const p2Z = position.data[i2Z];

            //third vertex
            let i3X = indices[i + 2] * 3;
            let i3Y = indices[i + 2] * 3 + 1;
            let i3Z = indices[i + 2] * 3 + 2;

            const p3X = position.data[i3X];
            const p3Y = position.data[i3Y];
            const p3Z = position.data[i3Z];

            const p1 = new Vec3(pX, pY, pZ);
            const p2 = new Vec3(p2X, p2Y, p2Z);
            const p3 = new Vec3(p3X, p3Y, p3Z);

            const centerX = (p1.x + p2.x + p3.x) / 3.0;
            const centerY = (p1.y + p2.y + p3.y) / 3.0;
            const centerZ = (p1.z + p2.z + p3.z) / 3.0;

            const nX = normal.data[iX];
            const nY = normal.data[iY];
            const nZ = normal.data[iZ];

            const n2X = normal.data[i2X];
            const n2Y = normal.data[i2Y];
            const n2Z = normal.data[i2Z];

            const n3X = normal.data[i3X];
            const n3Y = normal.data[i3Y];
            const n3Z = normal.data[i3Z];

            const n1 = new Vec3(nX, nY, nZ);
            const n2 = new Vec3(n2X, n2Y, n2Z);
            const n3 = new Vec3(n3X, n3Y, n3Z);

            const faceNormalX = (n1.x + n2.x + n3.x) / 3.0;
            const faceNormalY = (n2.y + n2.y + n3.y) / 3.0;
            const faceNormalZ = (n3.z + n2.z + n3.z) / 3.0;

            const faceNormal = new Vec3(faceNormalX, faceNormalY, faceNormalZ).normalize();

            for(let j = 0; j < 3; j++) {
                centroidData.push(centerX);
                centroidData.push(centerY);
                centroidData.push(centerZ);

                faceNormalData.push(faceNormal.x);
                faceNormalData.push(faceNormal.y);
                faceNormalData.push(faceNormal.z);

                triangleID.push(triangleIterator / (triangleCount-1));
            }

            triangleIterator++;

        }


        this.geometry = new Geometry(this.gl, {
            position: {
                data: new Float32Array(positionData),
                size: 3
            },
            normal: {
                data: new Float32Array(normalData),
                size: 3
            },
            uv: {
                data: new Float32Array(uvData),
                size: 2
            },
            center: {
                data: new Float32Array(centroidData),
                size: 3
            },
            faceNormal: {
                data: new Float32Array(faceNormalData),
                size: 3
            },
            triangleIndex: {
                data: new Float32Array(triangleID),
                size: 1
            }
        });

        console.log(this.geometry)

        this.program = new Program(this.gl, {
            uniforms: {
                uTime: {value: 0}
            },
            vertex,
            fragment,
            cullFace: null
        })

        this.ready = true;

    }

    update(dt) {
        if(!this.ready) return;
        this.program.uniforms.uTime.value += dt;
    }
}
