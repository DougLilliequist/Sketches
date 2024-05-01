import {Mesh, Vec3, Program, Transform, GLTFSkin} from 'ogl';

import {vertex} from './shader/vertex.js';
import fragment from './shader/fragment.frag?raw';

export default class KodamaMesh extends Transform {

    constructor(gl, {
        gltf
    }) {

        super(gl);

        this.gl = gl;
        this.gltf = gltf;

        this.mesh;
        this.skin;
        this.loadGLTF();

        this.currentPos = new Vec3(0.0, 0.0, 0.0);
        this.prevPos = new Vec3(0.0, 0.0, 0.0);
        this.velocity = new Vec3(0.0, 0.0, 0.0);
        this.acc = new Vec3(0.0, 0.0, 0.0);

        this.directionOffset = new Vec3(0.0, 0.0, 0.0);
        this.directionOffsetRadius = 2.0;

        this.directionStep = 2.0;

        this.PI2 = Math.PI * 2.0;
        this.updateDirection = false;
        this.randomAngle = Math.random() * this.PI2;

    }

      //src: https://github.com/oframe/ogl/blob/master/examples/load-gltf.html
      loadGLTF() {
        this.children.forEach((child) => child.setParent(null));

        const s = this.gltf.scene || this.gltf.scenes[0];
        s.forEach((root) => {
            root.setParent(this);
            root.traverse((node) => {
                if (node.program) {
                    node.program = this.createProgram(node);
                }
            });
        });

        this.updateMatrixWorld();

        // Calculate rough world bounds to update camera
        const min = new Vec3(+Infinity);
        const max = new Vec3(-Infinity);
        const center = new Vec3();
        const scale = new Vec3();

        const boundsMin = new Vec3();
        const boundsMax = new Vec3();
        const boundsCenter = new Vec3();
        const boundsScale = new Vec3();

        console.log(this.gltf.meshes);
        this.gltf.meshes.forEach((group) => {
            group.primitives.forEach((mesh) => {
                if(!mesh.parent) return;
                if (!mesh.geometry.bounds) mesh.geometry.computeBoundingSphere();
                boundsCenter.copy(mesh.geometry.bounds.center).applyMatrix4(mesh.worldMatrix);

                // Get max world scale axis
                mesh.worldMatrix.getScaling(boundsScale);
                const radiusScale = Math.max(Math.max(boundsScale[0], boundsScale[1]), boundsScale[2]);
                const radius = mesh.geometry.bounds.radius * radiusScale;

                boundsMin.set(-radius).add(boundsCenter);
                boundsMax.set(+radius).add(boundsCenter);

                // Apply world matrix to bounds
                for (let i = 0; i < 3; i++) {
                    min[i] = Math.min(min[i], boundsMin[i]);
                    max[i] = Math.max(max[i], boundsMax[i]);
                }

                this.mesh = mesh;

            });
        });

        scale.sub(max, min);
        const maxRadius = Math.max(Math.max(scale[0], scale[1]), scale[2]) * 0.5;
        center.add(min, max).divide(2);

    }

    createProgram(node) {

        let defines = `
        ${node.geometry.attributes.uv ? `#define UV` : ``}
        ${node.geometry.attributes.normal ? `#define NORMAL` : ``}
        ${node.geometry.isInstanced ? `#define INSTANCED` : ``}
        ${node.boneTexture ? `#define SKINNING` : ``}
        ${this.gltf.alphaMode === 'MASK' ? `#define ALPHA_MASK` : ``}
        ${this.gltf.baseColorTexture ? `#define COLOR_MAP` : ``}
        ${this.gltf.normalTexture ? `#define NORMAL_MAP` : ``}
        ${this.gltf.metallicRoughnessTexture ? `#define RM_MAP` : ``}
        ${this.gltf.occlusionTexture ? `#define OCC_MAP` : ``}
        ${this.gltf.emissiveTexture ? `#define EMISSIVE_MAP` : ``}
    `;

    let v = defines + vertex;
    let f = defines + fragment;

    const uniforms = {
        _Forward: {
            value: new Vec3(0.0, 0.0, 1.0)
        },
        _WorldPosOffset: {
            value: new Vec3(0.0, 0.0, 0.0)
        }
    }

    const program = new Program(this.gl, {
        uniforms,
        vertex: v,
        fragment: f,
        cullFace: null
    });

    return program;

    }

    wander({time}) {

        if(Math.floor(time*0.001) % this.directionStep === 0) {

            if(this.updateDirection === false) {
                console.log('UPDATE DIRECTION');
                this.updateDirection = true;
                this.randomAngle = Math.random() * this.PI2;
            }
        } else {
            this.updateDirection = false;
        }

        this.directionOffset.set(Math.cos(this.randomAngle) * this.directionOffsetRadius, 0.0, Math.sin(this.randomAngle) * this.directionOffsetRadius);
        const offset = new Vec3().copy(this.currentPos).sub(this.prevPos).normalize().scale(4.0).add(this.directionOffset);
        const target = new Vec3().copy(this.currentPos).add(offset).sub(this.currentPos);
        target.scale(0.015);

        this.prevPos.copy(this.currentPos);
        // this.currentPos.set(Math.cos(time*0.001)*3.0, 0.0, Math.sin(time*0.001)*3.0);
        this.currentPos.add(target);

        // if(this.currentPos.len() > 10.0) {
        //     this.currentPos.add(new Vec3(0.0, 0.0, 0.0).sub(this.currentPos).scale(0.01));
        // }
        // this.position.set(Math.cos(time*0.005)*3.0, 0.0, Math.sin(time*0.005)*3.0);
        this.Mesh?.program.uniforms._Forward.value.copy(this.currentPos).sub(this.prevPos).normalize();
        this.Mesh?.program.uniforms._WorldPosOffset.value.copy(this.currentPos);

    }

    animate() {
        if (this.gltf && this.gltf.animations && this.gltf.animations.length) {
            let { animation } = this.gltf.animations[0];
            animation.elapsed += 0.01;
            animation.update();
        }
    }

    update({time, deltaTime}) {

        this.wander({time});
        // this.animate();

    }

    get Mesh() {
        return this.mesh;
    }

}
