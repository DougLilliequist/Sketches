import {Mesh, Vec3, Box, Program, Transform, GLTFLoader, GLTFSkin, Geometry, Texture, Sphere} from 'ogl';

import vertex from './bust.vert?raw';
import fragment from './bust.frag?raw';


export class Bust extends Transform {
     constructor(gl) {
        super();
        this.gl = gl;
        this.init();
    }

    async init() {
        this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/matrix/assets/head2.gltf');

        //yuck...
        const {meshes} = this.gltf;
        let [meshPrimitives] = meshes;
        const {primitives} = meshPrimitives;
        let [mesh] = primitives;

        const geo = mesh.geometry;
        // const geo = new Sphere(this.gl, {widthSegments: 64, heightSegments: 64});
        // const geo = new Box(this.gl, {widthSegments: 64, heightSegments: 64, depthSegments: 64});

        const program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                tRipple: {value: new Texture(this.gl)}
            }
        });
        this.mesh = new Mesh(this.gl, {geometry: geo, program});

        this.addChild(this.mesh);
        this.scale.multiply(100);

    }

    set ripple(v) {
         if(!this.mesh) return;
        this.mesh.program.uniforms.tRipple.value = v;
    }

    computeCentroid(a, b, c) {
         const center = new Vec3();
         center.add(a, b);
         center.add(c);
         center.divide(3);
         return center;
    }

}
