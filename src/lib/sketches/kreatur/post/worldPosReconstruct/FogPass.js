import {Geometry, Mesh, Program, Texture, Plane, Mat4, Vec2, Vec3, Triangle} from "ogl";

import fogPassVert from './shader/fogPass.vert.glsl?raw';
import fogPassFrag from './shader/fogPass.frag.glsl?raw';

/**
 * Rename this class. will only rely on view space
 * because since I'm just using this for creating fog.
 *
 * Actually: rename this class to simply fog pass
 *
 */
export default class FogPass extends Mesh {

    constructor(gl, camera) {

        super(gl);

        this.gl = gl;

        this.camera = camera;

        this.corners = [
            new Vec3(0.0,0.0,0.0),
            new Vec3(0.0,0.0,0.0),
            new Vec3(0.0,0.0,0.0),
            new Vec3(0.0,0.0,0.0)
        ]

        this.frustum = new Vec2(2, 2)

        this.invViewMatrix = new Mat4();
        this.viewMatrix = new Mat4();

        this.initQuad();
        this.initProgram();
        this.calcFrustumCorners();

    }

    initQuad() {

        const refGeometry = new Plane(this.gl, {width: 2, height: 2});

        const {position, uv, index} = refGeometry.attributes;

        const cornerIndex = new Float32Array(4);

        cornerIndex[0] = 0;
        cornerIndex[1] = 1;
        cornerIndex[2] = 2;
        cornerIndex[3] = 3;

        // this.geometry = new Geometry(this.gl, {
        //
        //     position: {
        //         data: position.data,
        //         size: 3
        //     },
        //
        //     uv: {
        //         data: uv.data,
        //         size: 2
        //     },
        //
        //     frustumCornerIndex: {
        //         data: cornerIndex,
        //         size: 1
        //     },
        //
        //     index: {
        //         data: index.data
        //     }
        //
        // });

        this.geometry = new Triangle(this.gl);

    }

    initProgram() {

        const uniforms = {

            _BasePass: {
                value: new Texture(this.gl)
            },
            _Depth: {
                value: new Texture(this.gl)
            },
            _MainCameraInvViewMatrix: {
                value: this.invViewMatrix
            },
            _MainCameraViewMatrix: {
                value: this.viewMatrix
            },
            _CameraWorldPos: {
                value: this.camera.worldPosition
            },
            _FrustumCorners: {
                value: this.corners
            },
            _FrustumParams: {
              value: this.frustum
            },
            _Near: {
                value: this.camera.near
            },
            _Far: {
                value: this.camera.far
            },
            _Time: {
                value: 0
            }

        }

        this.program = new Program(this.gl, {
            uniforms,
            vertex: fogPassVert,
            fragment: fogPassFrag
        });

    }

    calcFrustumCorners() {
        const h = Math.tan((this.camera.fov * (Math.PI / 180.0)) * 0.5) * this.camera.far
        const w = h * this.camera.aspect;

        this.frustum.x = w;
        this.frustum.y = h;

        this.corners[0].set(-w, h, -this.camera.far);
        this.corners[1].set(w, h, -this.camera.far);
        this.corners[2].set(-w, -h, -this.camera.far);
        this.corners[3].set(w, -h, -this.camera.far);
    }

    update({camera, depth, color, dt}) {

        this.program.uniforms._MainCameraInvViewMatrix.value.copy(this.invViewMatrix.inverse(camera.viewMatrix));
        this.program.uniforms._CameraWorldPos.value.copy(camera.worldPosition);
        this.program.uniforms._Depth.value = depth;
        this.program.uniforms._BasePass.value = color;
        this.program.uniforms._Time.value += dt;


    }

}
