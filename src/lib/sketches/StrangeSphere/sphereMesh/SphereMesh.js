import {Mesh, Program, Texture} from 'ogl';
import {Sphere} from './sphere.js';

import {vertex} from './shader/vertex.js';
import {fragment} from './shader/fragment.js';

export class SphereMesh extends Mesh {

    constructor(gl) {

        super(gl);

        this.gl = gl;
        this.initGeometry();
        this.initProgram();

    }

    initGeometry() {
        
        this.geometry = new Sphere(this.gl, {
            widthSegments: 256,
            radius:1.0
        });

    }

    initProgram() {

        const matcap = new Image();
        matcap.crossOrigin = "*";
        matcap.src = './src/lib/sketches/StrangeSphere/assets/steel.jpg';

        const texture = new Texture(this.gl, {
            generateMipMaps: true
        });

        matcap.onload = () => texture.image = matcap;

        const uniforms = {

            _MatCap: {
                value: texture
            },
            _Time: {
                value: 0
            }

        }

        this.program = new Program(this.gl, {
            uniforms,
            vertex,
            fragment,
            cullFace: null
        })

    }

    update({time, deltaTime}) {

        this.program.uniforms._Time.value += deltaTime;

    }

}