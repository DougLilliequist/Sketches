import {Renderer, Camera, Transform, Orbit, Vec3, Vec2, RenderTarget} from 'ogl';
import Body from "$lib/sketches/kreatur/Body/Body.js";
import Creature from "$lib/sketches/kreatur/Creature.js";
import PostProcessing from "$lib/sketches/kreatur/post/PostProcessing.js";
import FogPass from "$lib/sketches/kreatur/post/worldPosReconstruct/FogPass.js";

/**
 * TODO:
 * - rename files (even though the knowledge comes from me...)
 * - work on body shader
 * - tweak pane params
 * - post FX
 *
 */

export class kreatur {
    constructor({el}) {

        this.init({el});

    }

    init({el}) {

        this.renderer = new Renderer({
            canvas: el,
            width: el.clientWidth,
            height: el.clientHeight,
            antialias: false,
            dpr: 1,
        });

        this.gl = this.renderer.gl;
        const bg = 0.0;
        this.gl.clearColor(bg,bg,bg, 1.0);

        const {
            clientWidth,
            clientHeight
        } = this.gl.canvas;

        this.wk = 1.0 / clientWidth;
        this.hK = 1.0 / clientHeight;

        this.camera = new Camera(this.gl, {
            aspect: clientWidth / clientHeight
        });

        this.camera.position.x = 0.0;
        this.camera.position.y = 0.0;
        this.camera.position.z = 10.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.0, 0),
        });

        this.scene = new Transform();

        this.creature = new Creature(this.gl);
        this.scene.addChild(this.creature);

        this.initWorldPosCaptureQuad();
        this.initPostPass();

    }

    initWorldPosCaptureQuad() {

        this.fogPass = new FogPass(this.gl, this.camera);

    }

    initPostPass() {

        this.basePass = new RenderTarget(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight,
            depthTexture: true,
            color: 2
        });

        this.post = new PostProcessing(this.gl);

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
            target,
            clear
        });
    }

    update({
        time,
        deltaTime
    }) {

        this.gl.time = time;
        this.gl.dt = deltaTime;
        this.controls.update();

        this.creature.update(time, deltaTime);

        this.render({
            scene: this.scene,
            camera: this.camera,
            target: this.basePass,
            clear: true
        });

        this.fogPass.update({camera: this.camera, depth: this.basePass.depthTexture, color: this.basePass.textures[0], dt: this.gl.dt});

        // this.render({scene: this.fogPass});

        this.post.render({scene: this.fogPass, depth: this.basePass.depthTexture, mask: this.basePass.textures[1], dt: this.gl.dt});

    }

    onResize({width, height}) {
        if (width && height) {
            this.renderer.setSize(width, height);
            const {
                clientWidth,
                clientHeight
            } = this.gl.canvas;

            this.wk = 1.0 / clientWidth;
            this.hK = 1.0 / clientHeight;

            this.camera.perspective({
                aspect: clientWidth / clientHeight
            });
        }
    }
}
