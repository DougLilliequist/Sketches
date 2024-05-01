import {Renderer, Camera, Transform, Orbit, Vec3, Vec2, GLTFLoader} from 'ogl';
import RagDollMesh from "$lib/sketches/ragdoll/ragdollmesh/RagDollMesh.js";
import SoftBody from "$lib/sketches/ragdoll/ragdollmesh/SoftBody.js";

export class RagDoll {
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
        this.camera.position.y = 0.5;
        this.camera.position.z = 5.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.5, 0),
        });

        this.scene = new Transform();
        this.loadModel()

    }

    loadModel = async() => {

        // this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/wandering/assets/ragdollskeleton_experimenting.gltf');
        this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/ragdoll/assets/ragdollskeleton_experimenting.glb');
        // this.gltf = await GLTFLoader.load(this.gl, 'src/lib/sketches/ragdoll/assets/head.glb');
        this.ragdoll = new RagDollMesh(this.gl, {
            gltf: this.gltf
        });

        this.ragdoll.setParent(this.scene);
        //this.ragdoll.position.y -= 1.0;

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

        this.ragdoll && this.ragdoll.update({camera: this.camera});

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
