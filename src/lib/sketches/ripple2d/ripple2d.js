import {Renderer, Camera, Transform, Orbit, Vec3, Vec2, Raycast} from 'ogl';
import ReactionDiffusionSimulator from "$lib/sketches/reactionDiffusion/simulator/ReactionDiffusionSimulator.js";
import RippleSimulator from "$lib/sketches/ripple2d/simulator/RippleSimulator.js";
import {Bust} from "$lib/sketches/ripple2d/bust.js";

export class ripple2d {
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
        const bg = 0.31;
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

        this.rayCast = new Raycast(this.gl);
        this.inputPos = new Vec2();
        this.prevHitUv = new Vec2();
        this.hitUvDelta = new Vec2();

        this.scene = new Transform();
        this.rippleSimulator = new RippleSimulator(this.gl, {width: 512, height: 512});
        this.bust = new Bust(this.gl);
        this.scene.addChild(this.rippleSimulator.display);
        // this.scene.addChild(this.bust);

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
        this.inputPos.set(userInput.posX * 2.0 - 1.0, userInput.posY * 2.0 - 1.0);

        this.rayCast.castMouse(this.camera, this.inputPos);

        // userInput.posX = 0;
        // userInput.posY = 0;
        // userInput.deltaX = 0;
        // userInput.deltaY = 0;

        // // const hits = this.rayCast.intersectBounds([this.bust]);
        // if(this.bust.mesh) {
        //     this.bust.isHit = false;
        //     const hits = this.rayCast.intersectMeshes([this.bust.mesh], {
        //         cullFace: true,
        //         maxDistance: 5,
        //         includeUV: true,
        //         includeNormal: false,
        //     });
        //     if (hits.length) {
        //         this.hitUvDelta.x = hits[0].hit.uv.x - this.prevHitUv.x;
        //         this.hitUvDelta.y = hits[0].hit.uv.y - this.prevHitUv.y;
        //         this.prevHitUv.copy(hits[0].hit.uv);
        //         this.inputPos.x = hits[0].hit.uv.x;
        //         this.inputPos.y = hits[0].hit.uv.y;
        //         // userInput.deltaX = this.hitUvDelta.x;
        //         // userInput.deltaY = this.hitUvDelta.y;
        //
        //     }
        //
        // }

        // this.rippleSimulator.update(deltaTime, {userInput: {
        //         deltaX: this.hitUvDelta.x,
        //         deltaY: this.hitUvDelta.y,
        //         posX: this.inputPos.x,
        //         posY: this.inputPos.y
        //     }});

        this.rippleSimulator.update(deltaTime, {userInput});

        this.bust.ripple = this.rippleSimulator.outPut;

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
