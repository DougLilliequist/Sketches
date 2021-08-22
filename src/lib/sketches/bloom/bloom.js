import {Renderer, Camera, Transform, Orbit, Vec3, Vec2} from 'ogl';
import SphereMesh from "./sphere/sphereMesh.js";
import PostProcessing from "./post/postProcessing.js";

export class bloom {
    constructor({el}) {

        this.init({el});

    }

    init({el}) {

        this.renderer = new Renderer({
            canvas: el,
            width: el.clientWidth,
            height: el.clientHeight, 
            antialias: false,
            dpr: 1
        });

        this.gl = this.renderer.gl;
        const bg = 0.0;
        this.gl.clearColor(bg,bg,bg, 0.0);

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

        this.renderToScreen = false;

        this.scene = new Transform();

        this.sphere = new SphereMesh(this.gl);
        this.sphere.setParent(this.scene);

        this.initPostPass();

    }

    initPostPass() {

        this.post = new PostProcessing(this.gl);

    }

    render({
        scene,
        camera = null,
        target = null,
        clear,
        time = 0
    }) {

        if(!this.renderToScreen) {
            this.post.render({scene, camera, time})
        } else {
            this.renderer.render({
                scene,
                camera,
                clear
            });
        }
    }

    update({
        time,
        deltaTime
    }) {

        this.controls.update();

        this.render({
            scene: this.scene,
            camera: this.camera,
            clear: true,
            time: time * 0.001
        });

    }

    onResize(width, height) {
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
