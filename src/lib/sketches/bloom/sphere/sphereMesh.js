import {Mesh, Program, Torus} from "ogl";
import {Sphere} from "ogl";

import vertex from './shader/vertex.vert?raw';
import fragment from './shader/fragment.frag?raw';

export default class SphereMesh extends Mesh {

    constructor(gl) {
        super(gl);

        this.gl = gl;

        this.geometry = new Torus(this.gl, {
            radius: 0.8,
            widthSegments: 64,
            heightSegments: 32
        });

        this.program = new Program(this.gl, {
            vertex,
            fragment
        });

    }

}