import {GPGPU} from 'ogl';
import { Texture } from 'ogl';
import { Vec2 } from 'ogl';
import { Mat4 } from 'ogl';

import positionKernel from './kernels/position.frag?raw';
import velocityKernel from './kernels/velocity.frag?raw';

export default class Simulator {

    constructor(gl, {width, height, camera}) {

        this.gl = gl;

        this.countX = width;
        this.countY = height;
        this.camera = camera;
        this.viewportWidth = 2;
        this.viewportHeight = 2;

        this.modelViewMatrix = new Mat4();
        this.viewProjectionMatrix = new Mat4();

        this.calcViewportDimensions();
        this.initEvents();
        this.initVelocity();
        this.initPosition();
        this.onResize();

    }

    calcViewportDimensions() {

        const dist = this.camera.position.z;
        this.viewportHeight = Math.tan((this.camera.fov * (Math.PI / 180.0)) * 0.5) * dist;
        this.viewportWidth = this.viewportHeight * this.camera.aspect;
    }

    initEvents() {

        window.addEventListener('resize', this.onResize);

    }

    initVelocity() {

        const initVelocityData = new Float32Array(this.countX * this.countY * 4);

        const paramsData = new Float32Array(this.countX * this.countY * 4.0);
        let paramsDataIterator = 0;
        for(let i = 0; i < this.countX * this.countY; i++) {

            paramsData[paramsDataIterator++] = Math.random();
            paramsData[paramsDataIterator++] = Math.random();
            paramsData[paramsDataIterator++] = Math.random();
            paramsData[paramsDataIterator++] = Math.random();

        }

        const paramsTexture = this.createDataTexture({data: paramsData, size: this.countX});

        this.velocity = new GPGPU(this.gl, {data: initVelocityData});

        const uniforms = {
            _Aspect: {
                value: (this.gl.renderer.width / this.gl.renderer.height)
            },
            _Fluid: {
                value: new Texture(this.gl)
            },
            _Position: {
                value: new Texture(this.gl)
            },
            _Params: {
                value: paramsTexture
            },
            _Bounds: {
                value: new Vec2(this.viewportWidth, this.viewportHeight)
            },
            _Seed: {
                value: 0
            },
            _Resolution: {
                value: new Vec2(this.gl.canvas.width, this.gl.canvas.height)
            },
            _ViewMatrix: {
                value: new Mat4()
            },
            _ProjectionMatrix: {
                value: new Mat4()
            },
            _ViewProjectionMatrix: {
                value: this.viewProjectionMatrix
            }
        }

        this.velocity.addPass({
            fragment: velocityKernel,
            uniforms
        });

    }

    initPosition() {

        const initPositionData = new Float32Array(this.countX * this.countY * 4);

        const TAU = Math.PI * 2.0;
        let positionIterator = 0;

        for(let y = 0; y < this.countY; y++) {
            for(let x = 0; x < this.countX; x++) {

                const hash1 = Math.random() * 2.0 - 1.0;
                const hash2 = Math.random() * 2.0 - 1.0;

                let posX = Math.cos(TAU * hash1) * this.viewportHeight * hash2 * 0.7;
                let posY = Math.sin(TAU * hash1) * this.viewportHeight * hash2 * 0.7;

                initPositionData[positionIterator++] = posX;
                initPositionData[positionIterator++] = posY;
                initPositionData[positionIterator++] = (Math.random() * 2.0 - 1.0) * 0.05;
                initPositionData[positionIterator++] = Math.random();

            }

        }

        const paramsData = new Float32Array(this.countX * this.countY * 4.0);
        let paramsDataIterator = 0;
        for(let i = 0; i < this.countX * this.countY; i++) {

            paramsData[paramsDataIterator++] = Math.random();
            paramsData[paramsDataIterator++] = Math.random();
            paramsData[paramsDataIterator++] = Math.random();
            paramsData[paramsDataIterator++] = Math.random();

        }

        const paramsTexture = this.createDataTexture({data: paramsData, size: this.countX});

        this.position = new GPGPU(this.gl, {data: initPositionData});

        const uniforms = {
            _Aspect: {
                value: (this.gl.renderer.width / this.gl.renderer.height)
            },
            _Velocity: {
                value: new Texture(this.gl)
            },
            _Params: {
                value: paramsTexture
            },
            _Bounds: {
                value: new Vec2(this.viewportWidth, this.viewportHeight)
            },
            _Seed: {
                value: 0
            },
            _Resolution: {
                value: new Vec2(this.gl.canvas.width, this.gl.canvas.height)
            },
            _ViewMatrix: {
                value: new Mat4()
            },
            _ProjectionMatrix: {
                value: new Mat4()
            },
            _ViewProjectionMatrix: {
                value: this.viewProjectionMatrix
            },
            _Dt: {
                value: 0.016
            }
        }

        this.position.addPass({
            fragment: positionKernel,
            uniforms
        });

        this.position.render();

    }

    updateVelocity(flowMap) {

        this.velocity.passes[0].program.uniforms._Fluid.value = flowMap;
        this.velocity.passes[0].program.uniforms._Position = this.position.uniform;

        this.velocity.render();

    }

    updatePosition(t) {

        this.position.passes[0].program.uniforms._Velocity = this.velocity.uniform;
        this.position.passes[0].program.uniforms._Seed.value += t;
        this.position.passes[0].program.uniforms._Dt.value = t;

        this.position.render();

    }

    update({flowMap, worldMatrix, t}) {

        this.modelViewMatrix.multiply(this.camera.viewMatrix, worldMatrix);
        this.viewProjectionMatrix.multiply(this.camera.projectionMatrix, this.modelViewMatrix);

        this.updateVelocity(flowMap);
        this.updatePosition(t);

    }

    get PositionPrev() {
        return this.position.fbo.write.texture;
    }

    get Position() {
        return this.position.uniform
    }

    createDataTexture({data, size}) {

        return new Texture(this.gl, {
            image: data,
            target: this.gl.TEXTURE_2D,
            type: this.gl.FLOAT,
            format: this.gl.RGBA,
            internalFormat: this.gl.renderer.isWebgl2 ? this.gl.RGBA32F : this.gl.RGBA,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            generateMipmaps: false,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            width: size,
            flipY: false
        })

    }

    onResize = () => {

        this.camera.updateMatrixWorld();
        this.calcViewportDimensions();
        this.position.passes[0].program.uniforms._Bounds.value.set(this.viewportWidth, this.viewportHeight);

    }

}
