import {Mesh, Vec3, Box, Program, Transform, Geometry, Vec2, Texture, GLTFLoader} from 'ogl';
// import {GLTFLoader} from '../../../ogl/src/extras/GLTFLoader.js';

import vertex from './matrixMesh.vert?raw';
import fragment from './matrixMesh.frag?raw';

import gsap from 'gsap';
import {createGBufferPrograms} from "$lib/sketches/matrix/utils/createGBufferPrograms.js";


export class MatrixMesh extends Transform {
     constructor(gl) {
        super();
        this.gl = gl;
        this.currentShapeIndex = 0;
        this.init();
        this.addHandlers();
    }

    async init() {
        this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/matrix/assets/volumetest2.gltf');
        // const test  = await GLTFLoader.load(this.gl, 'src/lib/sketches/matrix/assets/volumetest2.gltf');

        //yuck...
        const {meshes} = this.gltf;
        let [meshPrimitives] = meshes;
        const {primitives} = meshPrimitives;
        let [mesh] = primitives;

        this.geo = new Geometry(this.gl);

        const originGeometry = mesh.geometry;

        const refGeometry = new Box(this.gl );
        const refGeometryAttribs = refGeometry.attributes;
        let {position, normal, uv, index} = refGeometryAttribs;

        const instanceCount = originGeometry.attributes.position.count / originGeometry.attributes.position.size;

        const attributes = {
            position: {
                data: position.data,
                size: 3
            },
            normal: {
                data: normal.data,
                size: 3
            },
            rootPosition: {
                instanced: 1,
                data: originGeometry.attributes.position.data,
                size: 3
            },
            shapeIndex: {
                instanced: 1,
                data: originGeometry.attributes.data.data,
                size: 1
            },
            uv: {
                data: uv.data,
                size: 2
            },
            index: {
                data: index.data
            }
        }

        const uniforms = {
            tDepth: {value: new Texture(this.gl)},
            uShapePhase: {value: [1, 0]},
            uTime: {value: 0},
            uRevealHidePhase: {value: [0.5, 0]},
            uHash: {value: Math.random()},
        }

        const program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms
        });
        const geo = new Geometry(this.gl, attributes);
        this.mesh = new Mesh(this.gl, {geometry: geo, program});

        if(!this.gl.isWebgl2) this.mesh.gBufferPrograms = createGBufferPrograms(this.gl, {vertex, uniforms});

        this.addChild(this.mesh);

        this.shapePhases = [
            {value: 1},
            {value: 0}
        ];

        this.revealHidePhases = [
            {value: 0.5},
            {value: 0}
        ];

    }

    addHandlers() {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = e => {
         const targetIndex = parseFloat(e.key) - 1;
         if(isNaN(targetIndex) || targetIndex >  this.shapePhases.length-1) return;
        if(targetIndex === this.currentShapeIndex) return;
         this.mesh.program.uniforms.uShapePhase.value.forEach((phase, index) => {

             gsap.to(this.shapePhases[index], {
                 value: index === targetIndex ? 1.0 : 0.0,
                 duration: 1.5,
                 delay: index === targetIndex ? 1.5 : 0,
                 ease: "power2.inOut",
                 onUpdate: _=> this.mesh.program.uniforms.uShapePhase.value[index] = this.shapePhases[index].value
             });
         });

        this.mesh.program.uniforms.uRevealHidePhase.value.forEach((phase, index) => {
            this.revealHidePhases[index].value = (targetIndex === index) ? 0 : 0.5;
            gsap.to(this.revealHidePhases[index], {
                value: (targetIndex === index) ? 0.5 : 1.0,
                duration: 1.5,
                delay: (targetIndex === index) ? 1.5 : 0,
                ease: "power2.inOut",
                onUpdate: _=> this.mesh.program.uniforms.uRevealHidePhase.value[index] = this.revealHidePhases[index].value,
            });
        });

         this.currentShapeIndex = targetIndex;

    }

    update(t, depth) {
         if(!this.mesh) return;
         this.mesh.program.uniforms.uTime.value = t;
         if(depth) this.mesh.program.uniforms.tDepth.value = depth;
         //this.mesh.rotation.y = t * 0.00025;
        }

    computeCentroid(a, b, c) {
         const center = new Vec3();
         center.add(a, b);
         center.add(c);
         center.divide(3);
         return center;
    }

}
