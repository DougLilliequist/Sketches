import {Mesh, Program, Triangle, RenderTarget, Vec3, Texture, Vec2, Mat4, Plane} from "ogl";

import screenQuad from '../screenQuad.vert?raw'
import ssao from './shaders/ssao.frag?raw';
import kawaseBlur from './shaders/kawaseBlur.glsl?raw';
import DualFilterBlurPass from "$lib/sketches/matrix/post/dualFilterBlur/DualFilterBlur.js";

export default class SSAO {
    constructor(gl) {

        this.gl = gl;
        // this.geo = new Plane(this.gl, {width: 2, height: 2});
        this.geo = new Triangle(this.gl);
        // this.KERNELSIZE = 24;
        this.KERNELSIZE = 24;
        // this.KERNELSIZE = 64;
        this.tmpMat4 = new Mat4();

        this.frustum = new Vec2();
        this.corners = [
            new Vec3(),
            new Vec3(),
            new Vec3(),
            new Vec3(),
        ]

        this.initBuffers()
        this.initPrograms()

        pane.on('change',  data => {
            switch(data.presetKey) {
                case 'bias' : {
                    this.program.program.uniforms['uBias'].value = data.value;
                }
                break;
                case 'sampleRadius' : {
                    this.program.program.uniforms['uSampleRadius'].value = data.value;
                }
                break;
            }
        });

    }

    initBuffers() {
        let type;
        // Requested type not supported, fall back to half float
        if (!type) type = this.gl.HALF_FLOAT || this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES;

        const options = {
            width: this.gl.canvas.width,
            height: this.gl.canvas.height,
            type,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? (type === this.gl.FLOAT ? this.gl.RGBA32F : this.gl.RGBA16F) : this.gl.RGBA,
            minFilter: this.gl.LINEAR,
            magFilter: this.gl.LINEAR,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
        };

        this.ssaoBuffer = new RenderTarget(this.gl, options);
    }

    initPrograms() {

        const ssaoProgram = new Program(this.gl, {
            vertex: screenQuad,
            fragment: ssao,
            uniforms: {
                tPositions: {value: new Texture(this.gl)},
                tNormals: {value: new Texture(this.gl)},
                tNoise: {value: window.blueNoise},
                tDepth: {value: new Texture(this.gl)},
                uNoiseRes: {value: 256},
                uSamplePoints: {value: this.initSampleOffsets()},
                uSampleRadius: {value: 0.25}, //.17
                // uSampleRadius: {value: 0.17}, //.17
                // uSampleRadius: {value: 0.5}, //.17
                uBias: {value: 0.025}, //0.015
                uProjMatrix: {value: new Mat4()},
                uInvProjMatrix: {value: new Mat4()},
                uNear: {value: this.gl.camera.near},
                uFar: {value: this.gl.camera.far},
                uQuality: {value: this.KERNELSIZE},
                uResolution: {value: new Vec2(this.gl.canvas.width, this.gl.canvas.height)},
                uTime: {value: 0}
            }
        });

        this.program = new Mesh(this.gl, {
            geometry: this.geo,
            program: ssaoProgram
        });

        // this.blurPass = new Mesh(this.gl, {
        //     geometry: this.geo,
        //     program: new Program(this.gl, {
        //         vertex: screenQuad,
        //         fragment: kawaseBlur,
        //         uniforms: {
        //             tDiffuse: {value: new Texture(this.gl)},
        //             uTexelSize: {value: new Vec2(1.0 / (this.gl.canvas.width), 1.0 / (this.gl.canvas.height))}
        //         }
        //     })
        // });

        this.blurPass = new DualFilterBlurPass(this.gl, {stepCount: 1, width: this.gl.canvas.width, height: this.gl.canvas.height});

        this.ssaoBufferBlurred = new RenderTarget(this.gl, {width: this.gl.canvas.width * 0.5, height: this.gl.canvas.height * 0.5});


    }

    initSampleOffsets() {

        const samplePoints = [];
        for(let i = 0; i < this.KERNELSIZE; i++) {

            //sample points lie in a half-sphere (hemisphere)
            const dir = new Vec3();
            dir.x = Math.random() * 2.0 - 1.0;
            dir.y = Math.random() * 2.0 - 1.0;
            dir.z = Math.random();
            dir.normalize();

            let phase = i / (this.KERNELSIZE);
            phase = phase * phase;
            let scale = 0.1 + (phase * (1.0 - 0.1));
            // let scale = 1.0;
            dir.scale(scale);
            samplePoints.push(dir);

        }
        return samplePoints;

    }

    getRotationTexture() {

        const rotations = new Float32Array(4 * 4);
        let iterator = 0;

        for(let i = 0; i < rotations.length; i++) {

            rotations[iterator++] = Math.random() * 2.0 - 1.0;
            rotations[iterator++] = Math.random() * 2.0 - 1.0;
            rotations[iterator++] = 0.0;
            rotations[iterator++] = 0.0;

        }

        return this.createDataTexture({data: rotations, size: 4})
    }

    createDataTexture({data, size}) {

        return new Texture(this.gl, {
            image: data,
            target: this.gl.TEXTURE_2D,
            type:  this.gl.HALF_FLOAT || this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA16F : this.gl.RGBA,
            wrapS: this.gl.REPEAT,
            wrapT: this.gl.REPEAT,
            generateMipmaps: false,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            width: size,
            height: size,
            flipY: false,
        })

    }

    //WebGL1 approach (and horrible as MRT's allows for far more elegant solutions)
    //TODO: consider using CRYTEKS simplified version on WebGL1 which only requires depth
    render({positions, normals, time}) {
        this.program.program.uniforms['tPositions'].value = positions;
        this.program.program.uniforms['tNormals'].value = normals;
        this.program.program.uniforms['uTime'].value = time * 1.5;

        this.gl.renderer.render({scene: this.program, camera: this.gl.camera, target: this.ssaoBuffer});

        // this.blurPass.program.uniforms['tDiffuse'].value = this.ssaoBuffer.texture;
        // this.gl.renderer.render({scene: this.blurPass, target: this.ssaoBufferBlurred});

        this.blurPass.render({pass: this.ssaoBuffer});

    }

     // get Output() {return this.ssaoBuffer.texture;}
     // get Output() {return this.ssaoBufferBlurred.texture;}
    get Output() {return this.blurPass.Output;}

}
