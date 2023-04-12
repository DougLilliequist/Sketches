import {Mesh, Plane, Program, Texture} from "ogl";

import vertex from './display.vert?raw';
import fragment from './display.frag?raw';

export default class Display extends Mesh {
    constructor(gl) {

        const geo = new Plane(gl);
        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                tMap: {value: new Texture(gl)},
                uTime: {value: 0}
            },
            cullFace: null
        })

        super(gl, {geometry: geo, program});
    }

    set Texture(v) {
        this.program.uniforms['tMap'].value = v;
    }

}
