import {Renderer, Camera, Transform, Orbit, Vec3, Vec2, GLTFLoader} from 'ogl';
import KodamaMesh from './kodamaMesh/kodamaMesh.js';

export class wandering {
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
        this.camera.position.y = 10.0;
        this.camera.position.z = 10.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0, 0),
        });

        this.scene = new Transform();

        this.gltf;

        const image = new Image();
        image.crossOrigin = "*";
        image.src = 'src/lib/sketches/wandering/assets/metallicvoxels.png';

        // image.onload = () => console.log('IMAGE FOUND')

        this.loadModel()

    }

    loadModel = async() => {

        this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/wandering/assets/kodamav2_no_material_small.gltf');
        this.kodamaMesh = new KodamaMesh(this.gl, {
            gltf: this.gltf
        });

        this.kodamaMesh.setParent(this.scene);
        this.kodamaMesh.position.y -= 1.0;

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

        if(this.kodamaMesh)
        this.kodamaMesh.update({time, deltaTime});

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
