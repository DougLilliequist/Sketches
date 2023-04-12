import {Camera, Transform, Orbit, Vec3, Vec2} from 'ogl';
import {Renderer} from '../../../ogl/src/core/Renderer.js';
import Fluid from "$lib/sketches/screenspacefluid/Fluid";
import Flow from "$lib/sketches/screenspacefluid/Flow";
import Particles from "$lib/sketches/screenspacefluid/Particles";
import Normals from "$lib/sketches/screenspacefluid/normals/Normals";

export class screenspacefluid {
    constructor({el}) {

        this.init({el});
        // this.initVideo();
        this.initOpticalFlow();
        this.initFluidSim();
        this.initParticles();

    }

    init({el}) {

        this.renderer = new Renderer({
            canvas: el,
            width: el.clientWidth,
            height: el.clientHeight,
            antialias: true,
            powerPreference: 'high-performance',
            dpr: 1,
        });

        this.gl = this.renderer.gl;
        this.bgCol = 0.0;
        this.gl.clearColor(this.bgCol, this.bgCol, this.bgCol, 1.0);

        const {
            clientWidth,
            clientHeight
        } = this.gl.canvas;

        this.wk = 1.0 / clientWidth;
        this.hK = 1.0 / clientHeight;

        this.camera = new Camera(this.gl, {
            aspect: clientWidth / clientHeight,
            far: 1000
        });

        this.camera.position.x = 0.0;
        this.camera.position.y = 0.0;
        this.camera.position.z = 5.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.0, 0),
        });

        this.scene = new Transform();

    }

    initVideo() {

        this.streamAvailable = false;

        this.video = document.createElement("video");

        const options = {
            audio: false,
            video: {
                width: 640,
                height: 480
            }
        };

        navigator.mediaDevices
            .getUserMedia(options)
            .then(stream => {
                this.video.srcObject = stream;
                this.video.play();
                this.streamAvailable = true;
            })
            .catch(error => {
                console.error("no camera found");
            });
    }

    initOpticalFlow() {

        this.flow = new Flow(this.gl, {
            width: 640,
            height: 480
        });

    }

    initFluidSim() {

        this.fluidSim = new Fluid(this.gl);

    }

    initParticles() {

        const normal = new Normals(this.gl, this.renderer);

        this.particles = new Particles(this.gl, {camera: this.camera, normal: normal.Texture});
        this.particles.calcNormalProgram.setParent(this.scene);
    }

    render({
               scene,
               camera = null,
               target = null,
               clear
           }) {
        this.renderer.render({
            scene,
            camera,
            clear
        });
    }

    update({
               time,
               deltaTime,
               userInput
           }) {

        this.controls.update();

        // if (this.streamAvailable) {
        //
        //     this.flow.update({
        //         inputVideo: this.video
        //     });
        //
        //     this.fluidSim.update({
        //         flowVectorTexture: this.flow.flowVectorTextureRead.texture,
        //         userInput
        //     });
        //
        // }
        this.gl.camera = this.camera;
        this.fluidSim.update({
            flowVectorTexture: this.flow.flowVectorTextureRead.texture,
            userInput
        });

        this.gl.clearColor(this.bgCol, this.bgCol, this.bgCol, 1.0);

        this.particles.update({scene: this.scene, camera: this.camera, flowMap: this.fluidSim.FluidOutput, t: deltaTime})

        this.render({
            scene: this.scene,
            camera: this.camera,
            clear: true
        });

    }

    onResize({width, height}) {

        this.renderer.setSize(width, height);

        this.wk = 1.0 / width;
        this.hK = 1.0 / height;

        this.camera.perspective({
            aspect: width / height
        });
    }
}
