import {Program, RenderTarget, Texture, Vec3, Mat4, Vec4} from "ogl";

import vertex from './gpuPick.vert?raw';
import fragment from './gpuPick.frag?raw';

export class GpuPicker {
    constructor(gl) {

        this.gl = gl;

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
        })

        this.gpuPickProgram = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                tPosition: {value: new Texture(this.gl)},
                uRayDirection: {value: new Vec3(0, 0, -1)},
                uRayOrigin: {value: new Vec3(0, 0, 0)},
                uSize: {value: 2}
            }
        });

        this.objMatrix = new Mat4();
        this.objRayOrigin = new Vec3();
        this.objRayDirection = new Vec3();

        this.hitData = new Vec4(999, 999, 999, -1);

    }

    pick({mesh, positions, rayOrigin, rayDirection, size, worldMatrix} = {}) {

        this.objMatrix.inverse(worldMatrix);
        this.objRayOrigin.copy(rayOrigin).applyMatrix4(this.objMatrix);
        this.objRayDirection.copy(rayDirection).applyMatrix4(this.objMatrix).normalize();

        // this.objRayOrigin.copy(rayOrigin)
        // this.objRayDirection.copy(rayDirection)

        const prevProgram = mesh.program;
        mesh.program = this.gpuPickProgram;
        mesh.program.uniforms['tPosition'].value = positions;
        mesh.program.uniforms['uRayOrigin'].value.copy(this.objRayOrigin);
        mesh.program.uniforms['uRayDirection'].value.copy(this.objRayDirection);
        mesh.program.uniforms['uSize'].value = size;
        this.gl.renderer.render({scene: mesh, target: this.resultBuffer});
        mesh.program = prevProgram;

        this.gl.renderer.bindFramebuffer(this.resultBuffer)
        const pixels = new Float32Array([0, 0, 0, 0]);
        this.gl.readPixels(0, 0, 1, 1, this.gl.RGBA, this.gl.FLOAT, pixels);
        this.gl.renderer.bindFramebuffer();

        this.hitData.fromArray(pixels);
    }

    get result() { return this.hitData; }

}
