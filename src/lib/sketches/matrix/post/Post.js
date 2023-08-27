import {RenderTarget, Texture, Triangle, Mesh, Program, Vec2} from "ogl";

import screenQuad from './screenQuad.vert?raw'
import copy from '$lib/sketches/matrix/post/copy.frag?raw'
import composite from '$lib/sketches/matrix/post/composite.frag?raw'
import FxaaPass from "$lib/sketches/matrix/post/fxaa/fxaaPass.js";
// import {renderGBufferData} from "$lib/sketches/matrix/utils/renderGBufferData.js";
import SSAO from "$lib/sketches/matrix/post/SSAO/SSAO.js";
import {Pane} from "tweakpane";
import Background from "$lib/sketches/matrix/Background.js";

export default class Post {

    constructor(gl) {

        this.gl = gl;
        this.geo = new Triangle(this.gl);

        const width = this.gl.canvas.width;
        const height = this.gl.canvas.height;

        this.buffer = new RenderTarget(this.gl, {width, height, depth: true, depthTexture: true});
        this.bufferPrev = new RenderTarget(this.gl, {width, height, depth: true, depthTexture: true});

        this.shaderParams = {
            ssao_intensity: 1.0
        }

        this.initGBuffers();
        this.initCopyProgram();
        this.initFXAAPass();
        this.initSSAOPass();
        this.initComposite();

    }

    initGBuffers() {

        // if(!this.gl.renderer.isWebgl2) {

            // const params = {
            //     width: this.gl.canvas.width,
            //     height: this.gl.canvas.height,
            //     minFilter: this.gl.NEAREST,
            //     magFilter: this.gl.NEAREST,
            //     wrapS: this.gl.CLAMP_TO_EDGE,
            //     wrapT: this.gl.CLAMP_TO_EDGE,
            //     format: this.gl.RGBA,
            //     internalFormat: this.gl.RGBA16F,
            //     type: this.gl.HALF_FLOAT
            // }

            let type;
            // Requested type not supported, fall back to half float
            if (!type) type = this.gl.HALF_FLOAT || this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;

            // const options = {
            //     width: this.gl.canvas.width,
            //     height: this.gl.canvas.height,
            //     type,
            //     format: this.gl.RGBA,
            //     internalFormat: this.gl.RGBA16F,
            //     minFilter: this.gl.NEAREST,
            //     magFilter: this.gl.NEAREST,
            //     wrapS: this.gl.CLAMP_TO_EDGE,
            //     wrapT: this.gl.CLAMP_TO_EDGE,
            // };

        const options = {
            width: this.gl.canvas.width * 0.5,
            height: this.gl.canvas.height * 0.5,
            type: type || this.gl.HALF_FLOAT || this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA16F) : this.gl.RGBA,
            // minFilter: this.gl.NEAREST,
            unpackAlignment: 1,
        };

            this.viewPosBuffer = new RenderTarget(this.gl, options);
            this.normalBuffer = new RenderTarget(this.gl, options);

    }

    initCopyProgram() {

        this.copyProgram = new Mesh(this.gl, {
            geometry: this.geo,
            program: new Program(this.gl, {
                vertex: screenQuad,
                fragment: copy,
                uniforms: {tDiffuse: {value: new Texture(this.gl)}},
                transparent: false,
                depthTest: false,
                depthWrite: false
            })
        })

    }

    initFXAAPass() {
        this.fxaa = new FxaaPass(this.gl);
    }

    initSSAOPass() {
        this.ssao = new SSAO(this.gl);
    }

    initComposite() {

        const compositeProgramUniforms = {
            tDiffuse: {value: new Texture(this.gl)},
            tSSAO: {value: new Texture(this.gl)},
            tSSAOPrev: {value: new Texture(this.gl)},
            tDepth: {value: new Texture(this.gl)},
            uSSAOIntensity: {value: 1.0},
            uTime: {value: 0},
            uResolution: {value: new Vec2()}
        }


        let program = new Program(this.gl, {
            vertex: screenQuad,
            fragment: composite,
            uniforms: compositeProgramUniforms,
            transparent: false,
            depthTest: false,
            depthWrite: false
        });

        this.compositeProgram = new Mesh(this.gl, {
            geometry: this.geo,
            program
        });

        this.compositePane = window.pane.addFolder({
            title: 'composite'
        });
        this.compositePane.addInput(this.shaderParams, 'ssao_intensity').on('change', ev => {
            this.compositeProgram.program.uniforms['uSSAOIntensity'].value = ev.value;
        });

    }

    render(gl, {scene, camera, objects, time}) {

        this.takeSnapShot(this.buffer.depthTexture, this.bufferPrev);

        //render scene to texture
        this.gl.renderer.render({scene, camera, target: this.buffer});

        //render FXAA
        // this.fxaa.render({pass: this.buffer.texture});

        //if webgl1, render all objects (YUCK!) with normals and positions as color
        if(!this.gl.isWebgl2) this.renderGBufferData({scene, camera, objects});
        //else, skip this step and just proceed to SSAO which will have buffers containing normals and positions at this point
        this.ssao.render({positions: this.viewPosBuffer.texture, normals: this.normalBuffer.texture, time});

        const width = this.gl.canvas.width * 0.5;
        const height = this.gl.canvas.height * 0.5;
        //composite!
        this.compositeProgram.program.uniforms['tDiffuse'].value = this.buffer.texture;
        this.compositeProgram.program.uniforms['tSSAO'].value = this.ssao.Output;
        this.compositeProgram.program.uniforms['uTime'].value = time * 0.01;
        this.compositeProgram.program.uniforms['tDepth'].value = this.bufferPrev.texture;
        this.compositeProgram.program.uniforms['uResolution'].value.set(width, height);

        this.gl.renderer.render({scene: this.compositeProgram});

    }

    renderGBufferData({scene, camera, objects}) {

        const background = scene.children.filter(c => c instanceof Background)[0];
        background.hide();

        //render view space positions
        objects.forEach(object => {
            object.prevProgram = object.program;
            object.program = object?.gBufferPrograms?.displayViewPosition;
        });

        this.gl.renderer.render({scene, camera, target: this.viewPosBuffer});

        objects.forEach(object => object.program = object.prevProgram);

        //render normals
        objects.forEach(object => {
            object.prevProgram = object.program;
            object.program = object?.gBufferPrograms?.displayViewNormal;
        });

        this.gl.renderer.render({scene, camera, target: this.normalBuffer});

        objects.forEach(object => object.program = object.prevProgram);
        background.show();
    }

    onResize() {

        this.buffer.setSize(this.gl.canvas.width, this.gl.canvas.height);

    }

    takeSnapShot(texture, target) {
        this.copyProgram.program.uniforms['tDiffuse'].value = texture;
        this.gl.renderer.render({scene: this.copyProgram, target});
    }

    get depth() {
        return this.bufferPrev.texture;
    }

}
