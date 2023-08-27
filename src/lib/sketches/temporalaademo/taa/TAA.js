import {RenderTarget} from "ogl";

/**
 * Gist of process behind TAA:
 *
 * jitter camera frustum - this class needs to somehow alter the cameras frustum via jittering...
 * could perhaps be done by simply adding a flag that checks if TAA is enabled and perform jittering
 * in the camera class itself?
 *
 * generate velocity buffer - this buffer essentially generates motion vectors by taking the velocity of reconstructed
 * positions via a depth buffer. This is where you with a shock of realisation understand that this will not work for transparent objects
 * and/or objects where depth testing is not enabled...
 *
 * ...read somewhere about using stencils / id buffer...
 *
 * reprojection - use results from velocity buffer to sample previous frame (history buffer) by offsetting uvs with the calculated velocities
 * and do a feedback blend. Note: here we will also need to use colour clamping / cliping to prevent ghosting
 */

export default class TAA {
    constructor(gl) {

        this.gl = gl;
        this.HALTON_3_2_SEQUENCE = [];

    }

    initHistoryBuffer() {

        this.historyBuffer = {
            current: new RenderTarget(this.gl),
            prev: new RenderTarget(this.gl),
            swap: () => {
                let tmp = this.historyBuffer.current;
                this.historyBuffer.current = this.historyBuffer.prev;
                this.historyBuffer.prev = tmp;
            }
        };

    }

    initVelocityBuffer() {

        const params = {
            format: this.gl.RG,
            type: this.gl.HALF_FLOAT,
            internalFormat: this.gl.RG16F,
            minFilter: this.gl.LINEAR,
            magFilter: this.gl.LINEAR,
            generateMipmaps: false,
        }

        this.velocityBuffer = new RenderTarget(this.gl, params)

    }

    jitterCamera() {

    }

    updateVelocityBuffer() {

    }

    update({rasterizedOutput = null} = {}) {

    }

    onResize() {

        this.velocityBuffer.setSize(this.gl.canvas.width, this.gl.canvas.height);
        this.historyBuffer.current.setSize(this.gl.canvas.width, this.gl.canvas.height);
        this.historyBuffer.prev.setSize(this.gl.canvas.width, this.gl.canvas.height);

    }

}
