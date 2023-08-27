import {Renderer, Camera, Transform, Orbit, Vec3, Vec2} from 'ogl';
import {SphereMesh} from "$lib/sketches/StrangeSphere/sphereMesh/SphereMesh.js";

export class temporalaademo {
    constructor({el}) {

        this.init({el});

    }

    init({el}) {

        this.renderer = new Renderer({
            canvas: el,
            width: el.clientWidth,
            height: el.clientHeight,
            antialias: true,
            dpr: 1
        });

        this.gl = this.renderer.gl;
        const bg = 0.93;
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
        this.camera.position.z = 5.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.0, 0),
        });

        this.scene = new Transform();

        this.initMesh();

    }

    initMesh() {
        this.sphereMesh = new SphereMesh(this.gl);
        this.sphereMesh.setParent(this.scene);
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
        deltaTime
    }) {

        this.controls.update();

        this.sphereMesh.update({time, deltaTime});

        this.render({
            scene: this.scene,
            camera: this.camera,
            clear: true
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
