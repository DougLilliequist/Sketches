import {Program, RenderTarget, Texture, Vec2, Vec3, Mat4, Vec4, Geometry, Mesh, Triangle} from "ogl";

import vertex from './gpuPick.vert?raw';
import fragment from './gpuPick.frag?raw';

import positionDisplayVert from './positionDisplay.vert?raw';
import positionDisplayFrag from './positionDisplay.frag?raw';

export class GpuPicker {
    constructor(gl, {geometry} = {}) {

        this.gl = gl;

        const {attributes} = geometry;
        const {index} = attributes;

        const indexData = [];
        const triangleIndexData = [];
        let indexDataIterator = 0;

        let triangleIndexIerator = 0;
        let triangleIndex = 0;

        for(let i = 0; i < index.data.length; i++) {
            indexData[indexDataIterator++] = index.data[i];
        }

        for(let i = 0; i < index.data.length / 3; i++) {
            triangleIndexData[triangleIndexIerator++] = triangleIndex;
            triangleIndexData[triangleIndexIerator++] = triangleIndex;
            triangleIndexData[triangleIndexIerator++] = triangleIndex;
            triangleIndex++;
        }

        const indexGeometry = new Geometry(this.gl, {
            position: {
                size: 1,
                data: new Float32Array(indexData)
            },
            triangleIndex: {
                size: 1,
                data: new Float32Array(triangleIndexData)
            }
        })

        const positionDisplayProgram = new Program(this.gl, {
            vertex: positionDisplayVert,
            fragment: positionDisplayFrag,
            uniforms: {
                tPosition: {value: new Texture(this.gl)},
                uSize: {value: 256}
            }
        })

        this.positionDisplayMesh = new Mesh(this.gl, {
            geometry: indexGeometry,
            program: positionDisplayProgram
        });

        this.positionData = new RenderTarget(this.gl, {
            width: this.gl.canvas.width * 1,
            height: this.gl.canvas.height * 1,
            format: this.gl.RGBA,
            internalFormat: this.gl.RGBA16F,
            generateMipmaps: false,
            type: this.gl.HALF_FLOAT,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST,
            depth: true
        })

        this.resultBuffer = new RenderTarget(this.gl, {
            width: 1,
            height: 1,
            format: this.gl.RGBA,
            internalFormat: this.gl.RGBA32F,
            type: this.gl.FLOAT,
            generateMipMaps: false,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST
        });

        const pickGeometry = new Geometry(this.gl, {
            position: {
                size: 3,
                data: new Float32Array([0, 0, 0])
            }
        })

        this.gpuPickProgram = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                tPosition: {value: new Texture(this.gl)},
                uInputPos: {value: new Vec2(-1, -1)},
                uSize: {value: 2}
            }
        });


        this.pickProgram = new Mesh(this.gl, {
            mode: this.gl.POINTS,
            geometry: pickGeometry,
            program: this.gpuPickProgram
        });

        this.objMatrix = new Mat4();
        this.objRayOrigin = new Vec3();
        this.objRayDirection = new Vec3();

        this.hitData = new Vec4(999, 999, 999, -1);

        this.inputPos = new Vec2();

        //TODO:
        //- revisit the original idea of rendering the triangle indices and perform the ray lookup
        //- fuck up probably was caused by not having the initial click position....

        addEventListener('pointerdown', e => {

            this.inputPos.x = (e.x * this.gl.canvas.width) / this.gl.canvas.clientWidth
            this.inputPos.y = this.gl.canvas.height - (e.y * this.gl.canvas.height) / this.gl.canvas.clientHeight - 1
            this.pickProgram.program.uniforms['uInputPos'].value.copy(this.inputPos);

        })

        addEventListener('pointermove', e => {

            this.inputPos.x = (e.x * this.gl.canvas.width) / this.gl.canvas.clientWidth
            this.inputPos.y = this.gl.canvas.height - (e.y * this.gl.canvas.height) / this.gl.canvas.clientHeight - 1
            this.pickProgram.program.uniforms['uInputPos'].value.copy(this.inputPos);

        })

        addEventListener('resize', _=> {
            if(this.resizeDebounce) clearTimeout(this.resizeDebounce);
            this.resizeDebounce = setTimeout(_=> {
                this.positionData.setSize(this.gl.canvas.width, this.gl.canvas.height);
            }, 500)
        })

    }

    pick({positions, rayOrigin, rayDirection, size, worldMatrix, camera} = {}) {
        this.positions = positions;

        const clearColor = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);
        this.gl.clearColor(0, 0, 0, -1);
        this.positionDisplayMesh.program.uniforms['tPosition'].value = positions;
        this.positionDisplayMesh.program.uniforms['uSize'].value = 256;
        this.gl.renderer.render({scene: this.positionDisplayMesh, camera, target: this.positionData});
        this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

        this.objMatrix.inverse(worldMatrix);
        this.objRayOrigin.copy(rayOrigin).applyMatrix4(this.objMatrix);
        this.objRayDirection.copy(rayDirection).applyMatrix4(this.objMatrix).normalize();

        this.pickProgram.program.uniforms['tPosition'].value = this.positionData.texture;
        this.pickProgram.program.uniforms['uSize'].value = 256;
        this.gl.renderer.render({scene: this.pickProgram, target: this.resultBuffer});

        this.gl.renderer.bindFramebuffer(this.resultBuffer)
        let pixels = new Float32Array([0, 0, 0, 0]);
        this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.FLOAT, pixels);
        this.gl.renderer.bindFramebuffer();
        this.hitData.fromArray(pixels);
    }

    get result() { return this.hitData; }

}
