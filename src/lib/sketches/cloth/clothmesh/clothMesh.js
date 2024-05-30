import ClothSimulator from "./clothSimulator";
import {Plane, Program, Mesh, Texture, Vec2} from "ogl";

import vertex from './shaders/cloth.vs.glsl?raw';
import fragment from './shaders/cloth.fs.glsl?raw';

export default class ClothMesh extends Mesh {
    constructor(gl, {resolution = new Vec2(64, 64), camera} = {}) {
        super(gl);
        this.gl = gl;
        this.geometry = new Plane(this.gl, {width: 2, height: 2, widthSegments: resolution.x, heightSegments: resolution.y});
        this.data = new ClothSimulator(this.gl, {resolution, geometry: this.geometry, camera});
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

    }

    update({time = 0, inputPos, interacting} = {}) {

        this.data.update({time, inputPos, interacting});
        this.program.uniforms.tPosition.value = this.data.position;
        this.program.uniforms.tNormal.value = this.data.normals;

    }

}
