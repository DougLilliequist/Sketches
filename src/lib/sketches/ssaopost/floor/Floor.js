import {Mesh, Plane, Program, Transform} from "ogl";

import vertex from './floor.vs.glsl?raw';
import fragment from './floor.fs.glsl?raw';

export class Floor extends Transform {
    constructor(gl) {
        super();

        this.gl = gl;

        const geometry = new Plane(this.gl, {width: 200, height: 200});
        const program = new Program(this.gl, {
            vertex,
            fragment
        });

        this.mesh = new Mesh(this.gl, {
            geometry,
            program
        });

        this.mesh.rotation.x = -Math.PI * 0.5;

        this.addChild(this.mesh);

    }
}
