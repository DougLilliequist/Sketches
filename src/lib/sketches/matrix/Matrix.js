import {Renderer, Camera, Transform, Orbit, Vec3, Vec2, Texture} from 'ogl';
import {MatrixMesh} from "$lib/sketches/matrix/matrixMesh.js";
import Post from "$lib/sketches/matrix/post/Post.js";
import Background from "$lib/sketches/matrix/Background.js";

export class matrix {
    constructor({el}) {

        this.init({el});

    }

    async init({el}) {

        this.renderer = new Renderer({
            canvas: el,
            width: el.clientWidth,
            height: el.clientHeight,
            antialias: false,
            dpr: 2,
        });

        this.gl = this.renderer.gl;
        // const bg = 0.97;
        const bg = 0.0;
        this.gl.clearColor(bg,bg,bg, 1.0);

        this.initCommonAssets();

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
        this.camera.position.y = 0.2;
        this.camera.position.z = 5;

        this.camera.lookAt([0.0, 0.0, 0.0]);

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.0, 0),
        });

        this.gl.camera = this.camera;

        this.scene = new Transform();

        this.background = new Background(this.gl);
        this.background.scale.scale(10);
        this.scene.addChild(this.background);

        this.spikeyMesh = new MatrixMesh(this.gl);
        this.scene.addChild(this.spikeyMesh);

        this.post = new Post(this.gl);

    }

    initCommonAssets() {
        const image = new Image();
        window.blueNoise = new Texture(this.gl, {
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            wrapS: this.gl.REPEAT,
            wrapT: this.gl.REPEAT,
            generateMipmaps: false
        });
        image.crossOrigin = "*";
        image.src = 'src/lib/sketches/matrix/assets/images/blueNoiseRG256.png'
        image.onload = () => window.blueNoise.image = image;
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

        if(!this.spikeyMesh.mesh) return;

        this.controls.update();

        this.spikeyMesh.update(time, this.post.depth);

        this.post.render(this.gl, {
            scene: this.scene,
            camera: this.camera,
            objects: [this.spikeyMesh.mesh],
            time
        });

        // this.render({
        //     scene: this.scene,
        //     camera: this.camera,
        //     clear: true
        // });

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
