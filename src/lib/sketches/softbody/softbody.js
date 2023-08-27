import {Renderer, Camera, Transform, Orbit, Vec3, Vec2} from 'ogl';
import SoftBodyMesh from "$lib/sketches/softbody/SoftBodyMesh.js";
import SoftBodyMeshCPU from "$lib/sketches/softbody/SoftBodyMeshCPU.js";

export class softbody {
    constructor({el}) {

        this.init({el});

    }

    async init({el}) {

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
        this.camera.position.z = 15.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.0, 0),
        });

        this.scene = new Transform();
        this.ready = false;

        await this.initSoftBody();

        console.log(this.softBody);

        this.ready = true;

    }

    async initSoftBody() {

        return new Promise(async (resolve, reject) => {
            const tetGeometry = await (await fetch('src/lib/sketches/softbody/assets/head_tet_7.json')).json();
            const visGeometry = await (await fetch('src/lib/sketches/softbody/assets/head_vis_7.json')).json();
            const baryCentricData = await (await fetch('src/lib/sketches/softbody/assets/head_barycentric_data.json')).json();
            this.softBody = new SoftBodyMeshCPU(this.gl, {
                simulationGeo: tetGeometry,
                visualGeo: visGeometry,
                data: baryCentricData
            });
            this.softBody.scale.multiply(10)
            this.scene.addChild(this.softBody);

            this.ready = true;

            resolve();
        })

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
        this.controls.update();

        this.softBody.update();

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
