import {Program, RenderTarget, Texture, Vec2, Vec3, Mat4, Vec4, Geometry, Mesh, Triangle} from "ogl";

import vertex from './gpuPick.vert?raw';
import fragment from './gpuPick.frag?raw';

import triangleIndexDisplayVert from './triangleIndexDisplay.vert?raw';
import triangleIndexDisplayFrag from './triangleIndexDisplay.frag?raw';

import triangleListVert from './triangleList.vert?raw';
import triangleListFrag from './triangleList.frag?raw';

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


        //TODO:
        // - encode the indices in the position attribute so I can sample the position buffer
        // - create attribute for triangle index (which will be rendered as color)
        // - make a point geometry for each triangle and store the vertex indices in the XYZ components
        // - use the vertexID to place the said triangle in a 2D grid

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

        const triangleDisplayProgram = new Program(this.gl, {
            vertex: triangleIndexDisplayVert,
            fragment: triangleIndexDisplayFrag,
            uniforms: {
                tPosition: {value: new Texture(this.gl)},
                uSize: {value: 128}
            }
        })

        this.triangleDisplayMesh = new Mesh(this.gl, {
            geometry: indexGeometry,
            program: triangleDisplayProgram
        });

        const triangleData = [];
        let triangleDataIterator = 0;

        for(let i = 0; i < index.data.length / 3; i++) {
            triangleData[triangleDataIterator++] = index.data[i * 3];
            triangleData[triangleDataIterator++] = index.data[i * 3 + 1];
            triangleData[triangleDataIterator++] = index.data[i * 3 + 2];
        }

        const triangleListGeometry = new Geometry(this.gl, {
            position: {
                size: 3,
                data: new Float32Array(triangleData)
            }
        })

        const triangleListBufferSize = Math.pow(2, Math.ceil(Math.log2(Math.ceil(Math.sqrt(triangleListGeometry.attributes.position.count)))));

        this.triangleList = new RenderTarget(this.gl, {
            width: triangleListBufferSize,
            height: triangleListBufferSize,
            format: this.gl.RGBA,
            internalFormat: this.gl.RGBA16F,
            type: this.gl.HALF_FLOAT,
            generateMipMaps: false,
            depth: false,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST
        });

        const triangleListProgram = new Program(this.gl, {
            vertex: triangleListVert,
            fragment: triangleListFrag,
            uniforms: {
                uSize: {value: triangleListBufferSize}
            }
        })

        const triangleListMesh = new Mesh(this.gl, {
            mode: this.gl.POINTS,
            geometry: triangleListGeometry,
            program: triangleListProgram
        });

        this.gl.renderer.render({scene: triangleListMesh, target: this.triangleList});

        this.triangleData = new RenderTarget(this.gl, {
            width: this.gl.canvas.width * 1,
            height: this.gl.canvas.height * 1,
            format: this.gl.RED,
            internalFormat: this.gl.R32F,
            generateMipmaps: false,
            type: this.gl.FLOAT,
            wrapS: this.gl.CLAMP_TO_EDGE,
            wrapT: this.gl.CLAMP_TO_EDGE,
            minFilter: this.gl.NEAREST,
            magFilter: this.gl.NEAREST
        })

        this.resultBuffer = new RenderTarget(this.gl, {
            width: 1,
            height: 1,
            format: this.gl.RGBA,
            internalFormat: this.gl.RGBA16F,
            type: this.gl.HALF_FLOAT,
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
                tTriangles: {value: this.triangleList.texture},
                tIndex: {value: new Texture(this.gl)},
                uIndex: {value: -1},
                uRayDirection: {value: new Vec3(0, 0, -1)},
                uRayOrigin: {value: new Vec3(0, 0, 0)},
                uSize: {value: 2}
            }
        });

        // this.pickMesh = new Mesh(this.gl, {
        //     mode: this.gl.POINTS,
        //     geometry: indexGeometry,
        //     program: this.gpuPickProgram
        // });

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
        addEventListener('pointermove', e => {
            this.inputPos.x = (e.x * this.gl.canvas.width) / this.gl.canvas.clientWidth,
            this.inputPos.y = this.gl.canvas.height - (e.y * this.gl.canvas.height) / this.gl.canvas.clientHeight - 1
        })

    }

    pick({mesh, positions, rayOrigin, rayDirection, size, worldMatrix} = {}) {

        //render mesh with triangle indices as color
        const clearColor = this.gl.getParameter(this.gl.COLOR_CLEAR_VALUE);
        this.gl.clearColor(-1, 0, 0, -1);
        this.triangleDisplayMesh.program.uniforms['tPosition'].value = positions;
        this.triangleDisplayMesh.program.uniforms['uSize'].value = size;
        this.gl.renderer.render({scene: this.triangleDisplayMesh, camera: this.gl.camera, target: this.triangleData});
        this.gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

        //extract triangle index
        this.gl.renderer.bindFramebuffer(this.triangleData);
        let pixels = new Float32Array([0, 0, 0, 0]);
        this.gl.readPixels(this.inputPos.x, this.inputPos.y, 1, 1, this.gl.RED, this.gl.FLOAT, pixels);
        this.gl.renderer.bindFramebuffer();

        this.objMatrix.inverse(worldMatrix);
        // this.objRayOrigin.copy(rayOrigin).applyMatrix4(this.objMatrix);
        // this.objRayDirection.copy(rayDirection).applyMatrix4(this.objMatrix).normalize();

        this.objRayOrigin.copy(rayOrigin)
        this.objRayDirection.copy(rayDirection)

        //TODO:
        // - pass normalised mouse coordinates as uniform and sample texture inside pick program
        this.pickProgram.program.uniforms['tPosition'].value = positions;
        this.pickProgram.program.uniforms['tIndex'].value = this.triangleData.texture;
        this.pickProgram.program.uniforms['uRayOrigin'].value.copy(this.objRayOrigin);
        this.pickProgram.program.uniforms['uRayDirection'].value.copy(this.objRayDirection);
        this.pickProgram.program.uniforms['uIndex'].value = pixels[0];
        this.pickProgram.program.uniforms['uSize'].value = size;
        this.gl.renderer.render({scene: this.pickProgram, target: this.resultBuffer});

        this.gl.renderer.bindFramebuffer(this.resultBuffer)
        pixels = new Float32Array([0, 0, 0, 0]);
        this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.FLOAT, pixels);
        this.gl.renderer.bindFramebuffer();

        this.hitData.fromArray(pixels);
    }

    get result() { return this.hitData; }

}
