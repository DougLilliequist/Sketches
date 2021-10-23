import {Mesh, Texture} from 'ogl';
import {Program} from 'ogl';
import {Plane} from 'ogl';
import {Geometry} from 'ogl';
import {Shadow} from 'ogl';

import Simulator from './simulation/index.js';
import { Camera } from 'ogl';
import { Vec2 } from 'ogl';
import {Box} from 'ogl';
// import { params } from '../params';

import vertex from './shader/particles.vert?raw';
import fragment from './shader/particles.frag?raw';

import shadowVertex from './shader/particlesShadow.vert?raw';
import shadowFragment from './shader/particlesShadow.frag?raw';

export default class Particles extends Mesh {

    constructor(gl, {camera, normal}) {

        super(gl);

        this.gl = gl;

        this.camera = camera;

        this.countX = 512;
        this.countY = this.countX;
        this.calcViewportDimensions();
        this.initSimulator();
        this.initGeometry();
        this.initProgram({normal});
        this.initShadowPass({normal});

    }

    calcViewportDimensions() {

        const dist = this.camera.position.z;
        this.viewportHeight = Math.tan((this.camera.fov * (Math.PI / 180.0)) * 0.5) * dist;
        this.viewportWidth = this.viewportHeight * this.camera.aspect;
    }

    initSimulator() {

        this.simulator = new Simulator(this.gl, {width: this.countX, height: this.countY, camera: this.camera});

    }

    initGeometry() {

        const scale = 0.003;
        const refGeometry = new Plane(this.gl, {width: 1.0, height: 1.0});
        // const refGeometry = new Box(this.gl);
        const {position, normal, uv, index} = refGeometry.attributes;

        const localPositionData = position.data;
        const normalData = normal.data;
        const uvData = uv.data;
        const indexData = index.data;

        this.geometry = new Geometry(this.gl, {

            position: {
                size: 3,
                data: localPositionData
            },
            worldPosition: {
                instanced: 1,
                size: 2,
                data: this.simulator.position.coords
            },
            uv: {
                size: 2,
                data: uvData
            },
            normal: {
                size: 3,
                data: normalData
            },
            index: {
                data: indexData
            },

        });

    }

    initProgram({normal}) {

        // const shadowParams = gui.addFolder("shadow");
        // shadowParams.add(params.shadow, "BIAS", 0.0, 0.1, 0.0001).listen();

        const uniforms = {

            _Position: this.simulator.Position,
            _Velocity: {
                value: new Texture(this.gl)
            },
            _PrevPos: {
                value: this.simulator.PositionPrev
            },
            _Resolution: {
                value: new Vec2(this.gl.renderer.width, this.gl.renderer.height)
            },
            _ShadowMapTexelSize: {
                value: 1.0 / 1024
            },
            _ShadowWeight: {
                value: 1.0 / 16.0
            },
            _Bias: {
                value: 1.0/2048
            },
            _Normal: {
                value: normal
            },
            _Bounds: {
                value: new Vec2(this.viewportWidth, this.viewportHeight)
            },
            _FlowMap: {
                value: new Texture(this.gl)
            }

        }

        this.program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms,
            cullFace: this.gl.BACK,
            transparent: false
        });

    }

    initShadowPass({normal}) {

        this.shadowCamera = new Camera(this.gl, {
            near: 1.0,
            far: 20.0,
            left: -5.0,
            right: 5.0,
            top: 5.0,
            bottom: -5.0
        });


        this.shadowCamera.position.set(0.0, 10.0, 10.0);
        this.shadowCamera.lookAt([0.0, 0.0, 0.0]);

        this.shadowPass = new Shadow(this.gl, {light: this.shadowCamera, width: 1024, height: 1024});

        this.shadowPass.add({mesh: this, vertex: shadowVertex, fragment: shadowFragment});

    }

    update({scene, flowMap, t}) {

        const worldMatrix = this.worldMatrix;

        this.simulator.update({flowMap, worldMatrix, t});

        this.depthProgram.uniforms._Position = this.simulator.Position;

        this.shadowPass.render({scene});

        this.program.uniforms._Position = this.simulator.Position;
        this.program.uniforms._PrevPos.value = this.simulator.PositionPrev;
        this.program.uniforms._FlowMap.value = flowMap;

        this.program.uniforms._Velocity.value = this.simulator.velocity.fbo.read.texture;

        this.program.uniforms._Bias.value = 0.005;

    }

}
