import {Mesh, Program, Sphere, Vec3} from "ogl";

import vertex from './backgroundMesh.vert?raw';
import fragment from './backgroundMesh.frag?raw';

export default class Background extends Mesh{

    constructor(gl) {

        const geometry = new Sphere(gl);
        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uColor: {value: new Vec3(0.93, 1, 0.97)}
            },
            cullFace: gl.FRONT
        })

        super(gl, {geometry, program});
        this.gl = gl;

    }

    hide () {
        this.visible = false;
    }

    show() {
        this.visible = true;
    }

}
