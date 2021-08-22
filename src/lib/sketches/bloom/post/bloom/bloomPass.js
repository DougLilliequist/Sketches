import {Mesh, Program, RenderTarget, Texture, Triangle} from "ogl";
import vertex from "$lib/sketches/bloom/post/bloom/dualFilterBlurPass/shader/vertex.vert?raw";
import capture from "$lib/sketches/bloom/post/bloom/dualFilterBlurPass/shader/capture.frag?raw";
import lumaMask from './shaders/lumaMask.frag?raw';
import DualFilterBlurPass from "$lib/sketches/bloom/post/bloom/dualFilterBlurPass/dualFilterBlurPass";

export default class BloomPass {
    constructor(gl) {

        this.gl = gl;
        this.resolutionScale = 0.5;

        this.setSize({
            width: this.gl.canvas.width,
            height: this.gl.canvas.height
        });

        this.initCapturePass();
        this.initLumaMaskPass();
        this.initBlurPass();

    }

    initCapturePass() {

        //TODO: create capture pass so I can get the the FXAA at half resolution

        const uniforms = {
            _Pass: {
                value: new Texture(this.gl)
            }
        }

        this.captureProgram = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                uniforms,
                vertex,
                fragment: capture,
                depthTest: false,
                depthWrite: false,
                cull: null,
            })
        })

        this.captureTarget = this.createCaptureTarget();

    }

    createCaptureTarget() {

        return new RenderTarget(this.gl, {
            width: Math.floor(this.width * this.resolutionScale),
            height: Math.floor(this.height * this.resolutionScale)
        })

    }

    /*
        NOTE: THIS COULD BE USED FOR SIMPLY MASKING OUT ANYTHING IN THE ALPHA CHANNEL THAT IS STORED IN THE FXAA PASS'S
        ALPHA CHANNEL, THOUGH IT WILL REQUIRE SOME KIND OF TONEMAPPING FOR EXTRACTING THE VALUES THAT WILL
        BE USED FOR EVALUATING THE MASK
    */
    initLumaMaskPass() {

        const uniforms = {
            _ColorPass: {
                value: this.captureTarget.texture
            },
            _BrightnessThreshold: {
                value: 0.2
            },
            _SmoothWidth: {
                value: 1.0
            },
        }

        this.lumaMaskProgram = new Mesh(this.gl, {
            geometry: new Triangle(this.gl),
            program: new Program(this.gl, {
                uniforms,
                vertex,
                fragment: lumaMask,
                depthTest: false,
                depthWrite: false,
                cull: null,
            })
        })

        this.lumaMaskPassTarget = new RenderTarget(this.gl, {
            width: Math.floor(this.width * this.resolutionScale),
            height: Math.floor(this.height * this.resolutionScale)
        });

    }

    initBlurPass() {

        this.blurPass = new DualFilterBlurPass(this.gl, {width: this.gl.canvas.width, height: this.gl.canvas.height});

    }

    render({pass, time}) {

        //blit (capture) scene (which preferably has anti-aliasing applied)
        this.captureProgram.program.uniforms._Pass.value = pass;
        this.gl.renderer.render({scene: this.captureProgram, target: this.captureTarget, clear: false});

        //apply wide glow (TODO)

        //mask out the colors which will be used for the narrow glow
        this.lumaMaskProgram.program.uniforms._ColorPass.value = this.captureTarget.texture;
        this.gl.renderer.render({scene: this.lumaMaskProgram, target: this.lumaMaskPassTarget, clear: false});

        //blur the mask pass
        this.blurPass.render({pass: this.lumaMaskPassTarget, time});

        //combine wide and narrow glow (when wide glow pass is done)

    }

    setSize({width, height}) {
        this.width = width === null ? this.gl.canvas.width : width
        this.height = height === null ? this.gl.canvas.height : height
    }

    //TODO: CALL RESIZES
    onResize({width, height}) {

        this.captureTarget = this.createCaptureTarget();

    }

    get Output() {
        return this.blurPass.Output;
    }

}