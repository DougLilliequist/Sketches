import {Transform, GLTFLoader, Program, Mesh, Texture} from "ogl";
import {ShapeMatcher} from "$lib/sketches/elastic/elasticmesh/shapematching/ShapeMatcher.js";

import vertex from './vertex.vert?raw';
import fragment from './fragment.frag?raw';

export class ElasticMesh extends Transform {
    constructor(gl) {
        super();

        this.gl = gl;
        this.baseMesh = null;
        this.shapeMatcher = null;

        this.init();

    }

    async init() {
        // this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/elastic/assets/douglas_bust_reduce.glb');
        this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/elastic/assets/einsteinhead.glb');
        // this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/elastic/assets/head.glb');
        const {scene} = this.gltf;
        const {children} = scene[0];

        this.gltfMesh = children[0];
        const {geometry} = this.gltfMesh;

        this.shapeMatcher = new ShapeMatcher(this.gl, {geometry});

        const img = new Image();
        img.crossOrigin = "*";
        img.src = 'src/lib/sketches/elastic/assets/doug.jpg';

        const texture = new Texture(this.gl);
        img.onload = () => texture.image = img;

        const program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                tPositions: {value: this.shapeMatcher.initPositionNormal.textures[0]},
                tNormals: {value: this.shapeMatcher.initPositionNormal.textures[1]},
                tMap: {value: texture},
                uSize: {value: this.shapeMatcher.SIZE}
            },
            cullFace: null
        });

        this.mesh = new Mesh(this.gl, {
            geometry: this.gltfMesh.geometry,
            program
        })

        this.mesh.setParent(this);

    }

    update({time = 0, deltaTime = 0} = {}) {
        this?.shapeMatcher?.update?.({time, deltaTime, worldMatrix: this.worldMatrix});
        if(this.mesh) this.mesh.program.uniforms['tPositions'].value = this?.shapeMatcher?.positions;
        if(this.mesh) this.mesh.program.uniforms['tNormals'].value = this?.shapeMatcher?.normals;
    }

}
