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

        this.renderTarget = new RenderTarget(this.gl)

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

        this.program = new Mesh(this.gl, {
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

        //TODO: INCLUDE EMISSIVE PASS HERE

    }

    render({pass}) {

        this.program.program.uniforms.tMap.value = pass;
        this.gl.renderer.render({scene: this.program, target: this.renderTarget, clear: false});

    }

    onResize({width, height}) {

        this.createRenderTarget();
        this.program.program.uniforms._Resolution.value.set(this.gl.canvas.width, this.gl.canvas.height);

    }

    get Output() {
        return this.renderTarget.texture;
    }

}