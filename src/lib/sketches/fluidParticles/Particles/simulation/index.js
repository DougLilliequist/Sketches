import {GPGPU} from 'ogl';
import { Texture } from 'ogl';
import { Vec2 } from 'ogl';
import { Mat4 } from 'ogl';

import positionKernel from './kernels/position.frag?raw';

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

    initPosition() {

        const initPositionData = new Float32Array(this.countX * this.countY * 4);

        let positionIterator = 0;

        for(let y = 0; y < this.countY; y++) {
            for(let x = 0; x < this.countX; x++) {

                let posX = (Math.random() * 2.0 - 1.0) * this.viewportWidth;
                let posY = (Math.random() * 2.0 - 1.0) * this.viewportHeight;

                initPositionData[positionIterator++] = posX;
                initPositionData[positionIterator++] = posY;
                initPositionData[positionIterator++] = 0.0;
                initPositionData[positionIterator++] = 0.0;

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
                value: (this.gl.renderer.width / this.gl.renderer.height) / (640.0 / 480.0)
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
            }
        }

        this.position.addPass({
            fragment: positionKernel,
            uniforms
        });

    }

    updatePosition({flowMap, t}) {

        this.position.passes[0].program.uniforms._Velocity.value = flowMap;
        this.position.passes[0].program.uniforms._Seed.value += t;
        this.position.render();
    }

    update({flowMap, worldMatrix, t}) {

        this.updatePosition({flowMap, t});

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

        const aspect = (this.gl.renderer.width / this.gl.renderer.height) / (640.0 / 480.0);
        this.position.passes[0].program.uniforms._Aspect.value = aspect;

        this.calcViewportDimensions();
        this.position.passes[0].program.uniforms._Bounds.value.set(this.viewportWidth, this.viewportHeight);

    }

}
