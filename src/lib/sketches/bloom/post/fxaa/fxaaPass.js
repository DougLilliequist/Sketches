import {Mesh, Program, RenderTarget, Texture, Triangle, Vec2} from "ogl";

import vertex from './vertex.vert?raw';
import fxaa from './fxaa.frag?raw';

export default class FxaaPass {

    constructor(gl) {

        this.gl = gl;

        this.createRenderTarget();
        this.initProgram();

    }

    createRenderTarget() {

        return new RenderTarget(this.gl);

    }

    initProgram() {

        const uniforms = {
            tMap: {
                value: new Texture(this.gl)
            },
            _Resolution: {
                value: new Vec2(this.gl.canvas.width, this.gl.canvas.height)
            }
        }

        this.colorPass = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                uniforms,
                vertex,
                fragment: fxaa,
                depthWrite: false,
                depthTest: false,
                cullFace: null
            })
        });

        this.colorPassTarget = new RenderTarget(this.gl);

    }

    render({pass}) {

        this.colorPass.program.uniforms.tMap.value = pass;
        this.gl.renderer.render({scene: this.colorPass, target: this.colorPassTarget, clear: false});

    }

    onResize({width, height}) {

        this.colorPassTarget = this.createRenderTarget();
        this.colorPass.program.uniforms._Resolution.value.set(this.gl.canvas.width, this.gl.canvas.height);

    }

    get Output() {
        return this.colorPassTarget.texture;
    }

    get EmissiveMask() {
        return this.emissivePassTarget.texture;
    }

}