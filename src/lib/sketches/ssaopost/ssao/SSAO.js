import {RenderTarget, Triangle, Mesh, Program, Texture, Vec2} from "ogl";

import triangleVert from './triangle.vs.glsl?raw';
import linearDepth from './linearDepth.glsl?raw';
import normalDownSample from './normalDownSample.glsl?raw';
import ssao from './ssao.glsl?raw';
import deNoiseSSAO from './deNoiseSSAO.glsl?raw';
import upSampleSSAO from './upSampleSSAO.glsl?raw';

export default class SSAO {
    constructor(gl, {
        halfRes = false,
        sampleCount = 24
    } = {}) {

        this.gl = gl;
        this.halfRes = halfRes;
        this.dpr = halfRes ? 0.5 : 1;
        this.samples = sampleCount;
        this.frustum = new Vec2(2, 2);
        this.initBuffers();
        this.initPrograms();
        this.initTweakPane();
        this.onResize();

    }

    initBuffers() {
        this.width = Math.round(this.gl.canvas.width * this.dpr);
        this.height = Math.round(this.gl.canvas.height * this.dpr);

        this.linearDepthHalf = new RenderTarget(this.gl, {
            width: this.width,
            height: this.height,
            type: this.gl.HALF_FLOAT,
            internalFormat: this.gl.R16F,
            format: this.gl.RED,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
        });

        const options = {
            width: this.width,
            height: this.height,
            type: this.gl.HALF_FLOAT,
            internalFormat: this.gl.RG16F,
            format: this.gl.RG,
            minFilter: this.gl.LINEAR,
            magFilter: this.gl.LINEAR,
        }

        this.fbo = {
            read: new RenderTarget(this.gl, options),
            write: new RenderTarget(this.gl, options),
            swap: _=> {
                const tmp = this.fbo.read;
                this.fbo.read = this.fbo.write;
                this.fbo.write = tmp;
            }
        }

        this.outputBuffer = new RenderTarget(this.gl, {
            width: this.gl.canvas.width,
            height: this.gl.canvas.height
        });
    }

    initPrograms() {

        const nullTexture = new Texture(this.gl);
        const bigTriangle = new Triangle(this.gl);

        const linearDepthShader = new Program(this.gl, {
            vertex: triangleVert,
            fragment: linearDepth,
            uniforms: {
                tDepth: {value: nullTexture},
                uNear: {value: 0.1},
                uFar: {value: 100},
                uResolution: {value: new Vec2(2, 2)},
                uDownSample: {value: this.halfRes ? 1.0 : 0.0}
            },
            depthTest: false,
            depthWrite: false,
            transparent: false,
        });

        this.linearDepthBlitProgram = new Mesh(this.gl, {
            geometry: bigTriangle,
            program: linearDepthShader
        });

        const normalDownSampleShader = new Program(this.gl, {
            vertex: triangleVert,
            fragment: normalDownSample,
            uniforms: {
                tDepth: {value: nullTexture},
                tDepthDown: {value: nullTexture},
                tNormal: {value: nullTexture},
                uResolution: {value: new Vec2(2, 2)},
                uNear: {value: 0.1},
                uFar: {value: 100},
            },
            depthTest: false,
            depthWrite: false,
            transparent: false

        });

        this.normalDownSampleProgram = new Mesh(this.gl, {
            geometry: bigTriangle,
            program: normalDownSampleShader
        });

        const ssaoShader = new Program(this.gl, {
            vertex: triangleVert,
            fragment: ssao,
            uniforms: {
                tDepth: {value: nullTexture},
                tDepthLinear: {value: nullTexture},
                tNormal: {value: nullTexture},
                uNear: {value: 0.1},
                uFar: {value: 100},
                uResolution: {value: new Vec2(2, 2)},
                uProjectionScale: {value: 500},
                uSampleRadius: {value: 0.7},
                uBias: {value: 0.1},
                uHalfRes: {value: this.halfRes ? 1 : 0},
                uFrustum: {value: new Vec2(2, 2)},
                uIntensity: {value: 2.56},
                uContrast: {value: 1},
                uTau: {value: 34},
                uSamples: {value: this.samples},
                uDebug: {value: 1}
            },
            depthTest: false,
            depthWrite: false,
            transparent: false

        });

        this.ssaoProgram = new Mesh(this.gl, {
            geometry: bigTriangle,
            program: ssaoShader
        });

        const deNoiseShader = new Program(this.gl, {
            vertex: triangleVert,
            fragment: deNoiseSSAO,
            uniforms: {
                tAoDepth: {value: nullTexture},
                uDirection: {value: new Vec2(1, 0)},
                // uDepthSigma: {value: 5.8},
                uDepthSigma: {value: 10},
                uSigma: {value: 10.1},
                uFrustum: {value: new Vec2(2, 2)},
                uResolution: {value: new Vec2(2, 2)},
                uNear: {value: 0.1},
                uFar: {value: 100},
            },
            depthTest: false,
            depthWrite: false,
            transparent: false

        });

        this.deNoiseProgram = new Mesh(this.gl, {
            geometry: bigTriangle,
            program: deNoiseShader
        });

        const upsampleShader = new Program(this.gl, {
            vertex: triangleVert,
            fragment: upSampleSSAO,
            uniforms: {
                tDepth: {value: nullTexture},
                tAoDepth: {value: nullTexture},
                uNear: {value: 0.1},
                uFar: {value: 100},
                uSurfaceThreshold: {value: 0.10}
            },
            depthTest: false,
            depthWrite: false
        });

        this.upsampleProgram = new Mesh(this.gl, {
            geometry: bigTriangle,
            program: upsampleShader
        });

    }

    initTweakPane() {
        // return;
        this.ssaoParams = window.pane.addFolder({
            title: 'ssao'
        });

        this.ssaoParams.addInput(this.ssaoProgram.program.uniforms['uSampleRadius'], 'value', {
            label: 'sample radius',
        });

        this.ssaoParams.addInput(this.ssaoProgram.program.uniforms['uProjectionScale'], 'value', {
            label: 'projection scale',
        });

        this.ssaoParams.addInput(this.ssaoProgram.program.uniforms['uIntensity'], 'value', {
            label: 'intensity'
        });

        this.ssaoParams.addInput(this.ssaoProgram.program.uniforms['uContrast'], 'value', {
            label: 'contrast'
        });

        this.ssaoParams.addInput(this.ssaoProgram.program.uniforms['uSamples'], 'value', {
            label: 'sample count'
        });

        this.ssaoParams.addInput(this.ssaoProgram.program.uniforms['uBias'], 'value', {
            label: 'bias'
        });

        this.ssaoParams.addInput(this.ssaoProgram.program.uniforms['uTau'], 'value', {
            label: 'hash rotations',
            format: (v) => v.toFixed(1)
        });

        this.ssaoParams.addInput(this.ssaoProgram.program.uniforms['uDebug'], 'value', {
            label: 'debug',
        });

        this.denoiseParams = window.pane.addFolder({
            title: 'denoise'
        });

        this.denoiseParams.addInput(this.deNoiseProgram.program.uniforms['uSigma'], 'value', {
            label: 'sigma'
        })

        this.denoiseParams.addInput(this.deNoiseProgram.program.uniforms['uDepthSigma'], 'value', {
            label: 'depth sigma'
        })

        this.upsampleParams = window.pane.addFolder({
            title: 'upsample'
        });

        this.upsampleParams.addInput(this.upsampleProgram.program.uniforms['uSurfaceThreshold'], 'value', {
            label: 'surface threshold'
        })

    }

    render({depth = null, normals = null, camera = null} = {}) {

        if(!depth) return;
        if(!normals) return;

        this.gl.renderer.autoClear = false;

        this.linearDepthBlitProgram.program.uniforms['tDepth'].value = depth;
        this.linearDepthBlitProgram.program.uniforms['uNear'].value = camera?.near || 0.1;
        this.linearDepthBlitProgram.program.uniforms['uFar'].value = camera?.far || 100;
        this.linearDepthBlitProgram.program.uniforms['uResolution'].value.set(this.width, this.height);
        this.gl.renderer.render({scene: this.linearDepthBlitProgram, target: this.linearDepthHalf});

        this.calcFrustumCorners(camera);

        this.ssaoProgram.program.uniforms['tDepth'].value = depth;
        this.ssaoProgram.program.uniforms['tDepthLinear'].value = this.linearDepthHalf.texture;
        this.ssaoProgram.program.uniforms['tNormal'].value = normals;
        this.ssaoProgram.program.uniforms['uResolution'].value.set(this.width, this.height);
        this.ssaoProgram.program.uniforms['uFrustum'].value.set(this.frustum.x, this.frustum.y);
        this.ssaoProgram.program.uniforms['uNear'].value = camera?.near || 0.1;
        this.ssaoProgram.program.uniforms['uFar'].value = camera?.far || 100;
        this.gl.renderer.render({scene: this.ssaoProgram, camera, target: this.fbo.write});

        this.fbo.swap();

        this.deNoiseProgram.program.uniforms['uResolution'].value.set(this.width, this.height);
        this.deNoiseProgram.program.uniforms['tAoDepth'].value = this.fbo.read.texture;
        this.deNoiseProgram.program.uniforms['uDirection'].value.set(0.0, 1.0);
        this.gl.renderer.render({scene: this.deNoiseProgram, target: this.fbo.write});

        this.fbo.swap();

        this.deNoiseProgram.program.uniforms['uDirection'].value.set(1.0, 0.0);
        this.deNoiseProgram.program.uniforms['tAoDepth'].value = this.fbo.read.texture;
        this.gl.renderer.render({scene: this.deNoiseProgram, target: this.fbo.write});

        if(this.halfRes) {
            this.upsampleProgram.program.uniforms['tAoDepth'].value = this.fbo.write.texture;
            this.upsampleProgram.program.uniforms['tDepth'].value = depth;
            this.upsampleProgram.program.uniforms['uNear'].value = camera?.near || 0.1;
            this.upsampleProgram.program.uniforms['uFar'].value = camera?.far || 100;
            this.gl.renderer.render({scene: this.upsampleProgram, target: this.outputBuffer});
        }

        this.gl.renderer.autoClear = true;

    }

    calcFrustumCorners(camera) {
        const h = Math.tan((camera.fov * (Math.PI / 180.0)) * 0.5) * camera.far
        const w = h * camera.aspect;
        this.frustum.x = w;
        this.frustum.y = h;
    }

    get outPut() { return this.halfRes ? this.outputBuffer.texture : this.fbo.write.texture }

    onResize() {
        this.width = Math.round(this.gl.canvas.width * this.dpr);
        this.height = Math.round(this.gl.canvas.height * this.dpr);

        this.fbo.write.setSize(this.width, this.height);
        this.fbo.read.setSize(this.width, this.height);
        this.linearDepthHalf.setSize(this.width, this.height);
        this.outputBuffer.setSize(this.gl.canvas.width, this.gl.canvas.height);

    }

}
