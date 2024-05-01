import {Renderer, Camera, Transform, Orbit, Vec3, Vec2} from 'ogl';
import JumpFlood from "$lib/sketches/jumpflooding/jumpflood/JumpFlood.js";
import Display from "$lib/sketches/jumpflooding/display/Display.js";
import JumpFloodSimple from "$lib/sketches/jumpflooding/jumpflood/JumpFloodSimple.js";

export class jumpflooding {
    constructor({el}) {
        this.ready = false;
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
        this.camera.position.z = 2.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.0, 0),
        });

        this.scene = new Transform();

        const img = new Image();
        img.crossOrigin = "*";
        img.src = 'src/lib/sketches/jumpflooding/assets/nyancatouline.png';
        img.onload = () => {
            this.jumpFlood = new JumpFlood(this.gl, img);
            this.display = new Display(this.gl);

            this.scene.addChild(this.display);

            this.ready = true;
        }

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

        if(!this.ready) return;
        // this.controls.update();
        this.jumpFlood.update();
        this.display.program.uniforms['uTime'].value = time * 0.0001;
        this.display.Texture = this.jumpFlood.output;

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
