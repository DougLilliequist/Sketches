import {Renderer, Camera, Transform, Orbit, Vec3, Vec2, Triangle, Program, Texture, Mesh, RenderTarget} from 'ogl';
import {Floor} from "$lib/sketches/ssaopost/floor/Floor.js";
import {Bust} from "$lib/sketches/ssaopost/bust/Bust.js";

import display from './vfx/display.glsl?raw';
import composite from './vfx/composite.glsl?raw';
import SSAO from "$lib/sketches/ssaopost/ssao/SSAO.js";
import {MatrixMesh} from "$lib/sketches/matrix/matrixMesh.js";

export class ssaopost {
    constructor({el}) {

        this.init({el});

    }

    init({el}) {

        this.renderer = new Renderer({
            canvas: el,
            width: el.clientWidth,
            height: el.clientHeight,
            antialias: false,
            dpr: 2
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
            aspect: clientWidth / clientHeight,
        });

        this.camera.position.x = 0.0;
        this.camera.position.y = 1.0;
        this.camera.position.z = 5.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.0, 0),
        });

        this.scene = new Transform();

        this.floor = new Floor(this.gl);
        this.scene.addChild(this.floor);

        this.bust = new Bust(this.gl);
        this.bust.position.x = -1;
        this.scene.addChild(this.bust);

        this.matrixMesh = new MatrixMesh(this.gl);
        this.matrixMesh.position.y = 1;
        this.scene.addChild(this.matrixMesh);

        this.initVFX();

    }

    initVFX() {

        this.rtt = new RenderTarget(this.gl, {
            width: this.gl.canvas.width,
            height: this.gl.canvas.height,
            depthTexture: true,
            type: this.gl.HALF_FLOAT,
            internalFormat: this.gl.RGBA16F,
            format: this.gl.RGBA,
            color: 2
        });

        this.ssao = new SSAO(this.gl, {halfRes: true});

        const nullTexture = new Texture(this.gl);
        const geometry = new Triangle(this.gl);
        const program = new Program(this.gl, {
            vertex: display,
            fragment: composite,
            uniforms: {
                tMap: {value: nullTexture},
                tSSAO: {value: nullTexture},
                tDepth: {value: nullTexture}
            },
            depthTest: false,
            depthWrite: false,
            transparent: false
        });

        this.composite = new Mesh(this.gl, {geometry, program});
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

        this.controls.update();

        this.bust.rotation.y = time * 0.001;
        this.matrixMesh.update(time);

        this.render({
            scene: this.scene,
            camera: this.camera,
            target: this.rtt,
            clear: true
        });


        const normals = this.rtt.textures[1];
        const depth = this.rtt.depthTexture;

        this.ssao.render({depth, normals, camera: this.camera});

        this.composite.program.uniforms['tMap'].value = this.rtt.texture;
        this.composite.program.uniforms['tSSAO'].value = this.ssao.outPut;
        this.composite.program.uniforms['tDepth'].value = depth;
        this.render({scene: this.composite});

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

            this.rtt.setSize(this.gl.canvas.width, this.gl.canvas.height);
            this.ssao.onResize();

        }
    }
}
