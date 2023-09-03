import {Mesh, Post, Program, Texture, Triangle, Vec2} from "ogl";
import fxaa from './fxaa.glsl?raw';
import blur from './blur.glsl?raw';
import screen from './screen.glsl?raw';
import dither from './dither.glsl?raw';
import blitVert from './blit.vert.glsl?raw';
import blit from './blit.glsl?raw';
import Glow from "$lib/sketches/kreatur/post/Glow/Glow.js";

export default class PostProcessing {

    constructor(gl) {

        this.gl = gl;

        this.initFxaaPass();
        this.initBlurPass();
        this.initGlowPass();
        this.initFakeAtmospherePass();
        this.initDitherPass();

    }

    initFxaaPass() {

        this.blitMesh = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                uniforms: {
                    tMap: {value: new Texture(this.gl)}
                },
                vertex: blitVert,
                fragment: blit,
                depthTest: false,
                depthWrite: false,
                transparent: false
            }),
        })

        this.blitPass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight,
            targetOnly: true
        })

        this.blitPass.addPass({
            fragment: blit
        });

        this.fxaaPass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight,
            targetOnly: true
        });

        const uniforms = {
            _Resolution: {
                value: new Vec2(this.gl.canvas.clientWidth, this.gl.canvas.clientHeight)
            }
        }

        this.fxaaPass.addPass({
            uniforms,
            fragment: fxaa
        });

    }

    initBlurPass() {

        this.halfResBlit = new Post(this.gl, {
            width: this.gl.canvas.clientWidth*0.5,
            height: this.gl.canvas.clientHeight*0.5,
            targetOnly: true
        })

        this.halfResBlit.addPass();

        const scale = 0.5;
        this.blurPass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth*scale,
            height: this.gl.canvas.clientHeight*scale,
            // type: this.gl.HALF_FLOAT || this.gl.renderer.extensions['OES_texture_half_float'].HALF_FLOAT_OES,
            // internalFormat:  this.gl.renderer.isWebgl2 ? this.gl.RGBA16F : this.gl.RGBA,
        });

        let stepCount = 5;
        for(let i = 0; i < stepCount; i++) {

            const uniforms = {
                _StepSize: {
                    value: 0.5 + i
                },
                _Time: {
                    value: 0
                },
                _Resolution: {
                    value: new Vec2(this.gl.canvas.clientWidth*scale, this.gl.canvas.clientHeight*scale)
                },
                _Seed: {
                    value: i
                }
            }

            this.blurPass.addPass({
                uniforms,
                fragment: blur
            });

        }

    }

    initGlowPass() {
        this.glow = new Glow(this.gl, {passCount: 5});
    }

    initFakeAtmospherePass() {

        this.fakeAtmospherePass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight,
            targetOnly: false
        })

        const uniforms = {
            _Blur: {
                value: null
            },
            tGlow: {
                value: null
            },
            _Depth: {
                value: null
            },
            _Time: {
                value: 0
            }
        }

        this.fakeAtmospherePass.addPass({
            uniforms,
            fragment: screen
        });

    }

    initDitherPass() {

        this.ditherPass = new Post(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight
        })

        const uniforms = {
            _Time: {
                value: 0
            }
        }

        this.ditherPass.addPass({
            uniforms,
            fragment: dither
        });

    }

    render({scene, depth, dt, mask}) {

        // this.blitPass.render({scene});
        this.fxaaPass.render({scene});

        // this.blitMesh.program.uniforms.tMap.value = this.fxaaPass.uniform;
        this.halfResBlit.render({texture: this.fxaaPass.uniform});

        this.blurPass.passes.forEach((pass) => {
            pass.program.uniforms._Time.value += dt;
        });
        this.blurPass.render({texture: this.halfResBlit.uniform});

        this.glow.render({inputTexture: mask});

        this.fakeAtmospherePass.passes[0].program.uniforms._Blur = this.blurPass.uniform;
        this.fakeAtmospherePass.passes[0].program.uniforms.tGlow.value = this.glow.output.texture;
        this.fakeAtmospherePass.passes[0].program.uniforms._Depth.value = depth;
        this.fakeAtmospherePass.passes[0].program.uniforms._Time.value += dt;
        this.fakeAtmospherePass.render({scene: this.fxaaPass.passes[0].mesh});

    }

    onResize({width, height}) {
        this.fxaaPass.resize({width, height});
        this.blurPass.resize({width: width*0.5, height: height*0.5});
        this.fakeAtmospherePass.resize({width, height});
        this.ditherPass.resize({width, height})

    }

}
