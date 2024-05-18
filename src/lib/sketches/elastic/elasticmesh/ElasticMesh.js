import {Transform, GLTFLoader} from "ogl";
import {ShapeMatcher} from "$lib/sketches/elastic/elasticmesh/shapematching/ShapeMatcher.js";

export class ElasticMesh extends Transform {
    constructor(gl) {
        super();

        this.gl = gl;
        this.baseMesh = null;
        this.shapeMatcher = null;

        this.init();

    }

    async init() {
        this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/elastic/assets/douglas_bust.glb');
        const {scene} = this.gltf;
        const {children} = scene[0];

        this.mesh = children[0];
        this.shapeMatcher = new ShapeMatcher(this.gl, {geometry: this.mesh.geometry})

        this.mesh.setParent(this);

    }
}
