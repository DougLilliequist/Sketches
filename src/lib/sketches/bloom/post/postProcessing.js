import {Mesh, Program, RenderTarget, Triangle} from "ogl";
import FxaaPass from "$lib/sketches/bloom/post/fxaa/fxaaPass";
import DualFilterBlurPass from "$lib/sketches/bloom/post/bloom/dualFilterBlurPass/dualFilterBlurPass";

import vertex from './shader/vertex.vert?raw'
import fragment from './shader/fragment.frag?raw';
import BloomPass from "$lib/sketches/bloom/post/bloom/bloomPass";

export default class PostProcessing extends Mesh {

    constructor(gl) {
        super(gl);

        this.gl = gl;
        this.passes = [];

        this.createSceneCaptureTarget();

        this.initFXAAPass();
        // this.initBlurPass();
        this.initBloomPass();
        this.initFinalPass();

    }

    createSceneCaptureTarget() {

        const params = {
            minFilter: this.gl.LINEAR,
            magFilter: this.gl.LINEAR,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
        }

        this.sceneCaptureTarget = new RenderTarget(this.gl, params);

    }

    initFXAAPass() {

        this.fxaa = new FxaaPass(this.gl);
        this.passes.push(this.fxaa);

    }

    initBlurPass() {

        this.blurPass = new DualFilterBlurPass(this.gl, {width: this.gl.canvas.width, height: this.gl.canvas.height});

    }

    initBloomPass() {

        this.bloomPass = new BloomPass(this.gl);

    }

    initFinalPass() {

        const uniforms = {
            _FxaaPassOutput: {
                value: this.fxaa.Output
            },
            _BlooomPassOutput: {
                value: this.bloomPass.Output
            },
            _Time: {
                value: 0
            }
        }

        this.finalPass = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                uniforms,
                vertex,
                fragment,
                depthTest: false,
                depthWrite: false,
                transparent: false,
                cullFace: null
            })
        });

    }

    render({scene, camera, time}) {

        //shader scene to texture which will go through the post processing process
        if(camera) {
            this.gl.renderer.render({scene, camera, target: this.sceneCaptureTarget, clear: true});
        } else {
            this.gl.renderer.render({scene, target: this.sceneCaptureTarget, clear: true});
        }

        this.fxaa.render({pass: this.sceneCaptureTarget.texture});
        // this.blurPass.render({pass: this.fxaa.Output, time});
        this.bloomPass.render({pass: this.fxaa.Output, time});

        this.finalPass.program.uniforms._Time.value = time;
        this.gl.renderer.render({scene: this.finalPass, clear: false});

    }

    onResize({width, height}) {

        this.createSceneCaptureTarget();
        this.fxaa.onResize();
        this.blurPass.onResize({width: this.gl.canvas.width, height: this.gl.canvas.height});

    }

}