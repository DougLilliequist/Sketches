import {Mesh, Vec3, Program, Transform, Mat4, Quat, Mat3} from 'ogl';
import {GLTFSkin} from "../../../../ogl/src/extras/GLTFSkin.js";
import * as Mat3Func from '../../../../ogl/src/math/functions/Mat3Func.js'

import {vertex} from './shader/vertex.js';
import fragment from './shader/fragment.frag?raw';

export default class SoftBody extends Transform {

    constructor(gl, {
        gltf
    }) {

        super(gl);

        this.gl = gl;
        this.gltf = gltf;
        this.mesh;
        this.constraints = [];

        this.directionOffset = new Vec3(0.0, 0.0, 0.0);
        this.directionOffsetRadius = 2.0;

        this.directionStep = 2.0;

        this.PI2 = Math.PI * 2.0;
        this.updateDirection = false;
        this.randomAngle = Math.random() * this.PI2;

        this.SUBSTEPCOUNT = 10;
        this.dt = (1.0 / 120.0) / this.SUBSTEPCOUNT;
        // this.dt = (1.0 / 60.0);
        // this.dt = (1.0 / 120.0);

        this.centerOfMass = new Vec3();
        this.initCenterOfMass = new Vec3();
        this.q = [];
        this.p = [];

        this.idealQuat = new Quat(0,0,0,0);
        this.AQQ = new Mat3().identity();
        this.APQ = new Mat3().identity();
        this.A = new Mat3().identity();
        this.R = new Mat3().identity();

        this.firstTick = true;
        this.ready = false;

        this.joints;

        console.log(this.AQQ);
        console.log(this.APQ);

        this.loadGLTF();


    }

    //src: https://github.com/oframe/ogl/blob/master/examples/load-gltf.html
    loadGLTF() {
        this.children.forEach((child) => child.setParent(null));

        const s = this.gltf.scene || this.gltf.scenes[0];
        s.forEach((root) => {
            root.traverse((node) => {
                if (node.program) {
                    this.mesh = new Mesh(this.gl, {
                        // skeleton: node.skeleton,
                        geometry: node.geometry,
                        program: this.createProgram(node)
                    });
                    // this.particles = this.mesh.skeleton.joints;
                    this.mesh.setParent(this);
                    this.initShapeMatching();
                    this.ready = true;
                }
            });
        });


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

        const uniforms = {}

        const program = new Program(this.gl, {
            uniforms,
            vertex: v,
            fragment: f,
            cullFace: null
        });

        return program;

    }

    createConstraint(pa, pb, m1 = 1, m2 = 1) {

        //const localPosA = pa.position.clone().applyMatrix4(new Mat4().copy(pa.worldMatrix).inverse())
        //const localPosB = pb.position.clone().applyMatrix4(new Mat4().copy(pb.worldMatrix).inverse())

        const obj = {
            a: pa,
            b: pb,
            m1,
            m2,
            correctionA: new Vec3(),
            correctionB: new Vec3(),
            restLength: pa.position.clone().distance(pb.position.clone())
        }

        return obj;

    }

    initShapeMatching() {

        this.particles = [];

        var angle = Math.PI / 2;

        // Quaternion components
        var qScalar = Math.cos(angle / 2);
        var qVectorX = Math.sin(angle / 2);

        for(let i = 0; i < this.mesh.geometry.attributes.position.data.length / 3; i++) {
            this.particles[i] = {};
            const x = this.mesh.geometry.attributes.position.data[i * 3];
            const y = this.mesh.geometry.attributes.position.data[i * 3 + 1];
            const z = this.mesh.geometry.attributes.position.data[i * 3 + 2];

            const nX = this.mesh.geometry.attributes.normal.data[i * 3];
            const nY = this.mesh.geometry.attributes.normal.data[i * 3];
            const nZ = this.mesh.geometry.attributes.normal.data[i * 3];

            this.particles[i].position = new Vec3(x, y, z);
            this.particles[i].normal = new Vec3(nX, nY, nZ);
            // this.particles[i].position.applyQuaternion(new Quat().fromAxisAngle(new Vec3(1.0, 0.0, 0.0), angle));
        }

        let randomDir = new Vec3(2.0 * Math.random() - 1.0, 2.0 * Math.random() - 1.0, 2.0 * Math.random() - 1.0);
        this.particles.forEach(joint => {
            joint.velocity = new Vec3().copy(randomDir).scale(0.0);
            joint.prevPosition = new Vec3();
            joint.correction = new Vec3();
            joint.p = new Vec3();
            joint.q = new Vec3();
        });

        this.initCenterOfMass = this.calcCenterOfMass(true);
        this.q = this.calcRelativePositions(this.initCenterOfMass);

        this.centerOfMass = this.calcCenterOfMass();
        this.p = this.calcRelativePositions(this.centerOfMass);

        this.constructMatrix(this.q, this.q, this.AQQ, true);
        this.constructMatrix(this.p, this.q, this.APQ, false);


    }

    calcCenterOfMass(isInit = false) {
        let tmp = new Vec3();
        this.particles.forEach(joint => { tmp.add(joint.position.clone());});
        tmp.divide(this.particles.length);
        return tmp;
    }

    calcRelativePositions(cm) {
        let _pos = [];
        this.particles.forEach((joint, i) => {_pos.push(joint.position.clone().sub(cm));});
        return _pos;
    }

    constructMatrix(p, q, A, isQQ = false) {

        let colA = new Vec3();
        let colB = new Vec3();
        let colC = new Vec3();

        for(let i = 0; i < p.length; i++) {
            colA.add(p[i].clone().multiply(q[i].x));
            colB.add(p[i].clone().multiply(q[i].y));
            colC.add(p[i].clone().multiply(q[i].z));
        }

        A[0] = colA.x;
        A[1] = colA.y;
        A[2] = colA.z;

        A[3] = colB.x;
        A[4] = colB.y;
        A[5] = colB.z;

        A[6] = colC.x;
        A[7] = colC.y;
        A[8] = colC.z;

        isQQ && A.inverse(); //based on recent logs, this might blow up

        return A;

    }

    extractRotation(A, iterationCount) {
        let omega;
        let quat = new Quat();
        let rColA = new Vec3();
        let rColB = new Vec3();
        let rColC = new Vec3();

        let aColA = new Vec3(A[0], A[1], A[2]);
        let aColB = new Vec3(A[3], A[4], A[5]);
        let aColC = new Vec3(A[6], A[7], A[8]);

        let rColAxaColA = new Vec3();
        let rColBxaColB = new Vec3();
        let rColCxaColC = new Vec3();

        let w = 0;

        let eps = 1.0e-9;

        let R = new Mat3();

        if(this.firstTick) {
            this.firstTick = false;
            //quat = new Quat().fromMatrix3(A);
            quat = new Quat().fromMatrix3(new Mat3().identity());
        }


        for(let i = 0; i < iterationCount; i++) {
            R.fromQuaternion(quat);

            rColA.set(R[0], R[1], R[2]);
            rColB.set(R[3], R[4], R[5]);
            rColC.set(R[6], R[7], R[8]);

            rColAxaColA = new Vec3().cross(rColA, aColA);
            rColBxaColB = new Vec3().cross(rColB, aColB);
            rColCxaColC = new Vec3().cross(rColC, aColC);

            omega = new Vec3();
            omega.add(rColAxaColA);
            omega.add(rColBxaColB);
            omega.add(rColCxaColC);

            let denom = 1.0 / (Math.abs(rColA.dot(aColA) + rColB.dot(aColB) + rColC.dot(aColC)) + eps);
            omega.multiply(denom);

            w = omega.len();
            if(w < eps) break;

            let omegaAxis = new Quat().fromAxisAngle(omega.multiply(1.0 / w), w).multiply(quat);
            quat.copy(omegaAxis);
            quat.normalize();

        }

        return quat;

    }

    calculateRotationMatrix() {
        //this.idealQuat = this.extractRotation(this.APQ, 20);
        // this.A.multiply(this.APQ, this.AQQ);
    }

    applyGoalPositions(q) {
        const R = new Mat3().fromQuaternion(this.idealQuat);
        const A = new Mat3().multiply(this.APQ, this.AQQ);

        const finalMatrix = new Mat3();
        const beta = 0.5;
        finalMatrix[0] = beta * A[0] + (1.0 - beta) * R[0];
        finalMatrix[1] = beta * A[1] + (1.0 - beta) * R[1];
        finalMatrix[2] = beta * A[2] + (1.0 - beta) * R[2];

        finalMatrix[3] = beta * A[3] + (1.0 - beta) * R[3];
        finalMatrix[4] = beta * A[4] + (1.0 - beta) * R[4];
        finalMatrix[5] = beta * A[5] + (1.0 - beta) * R[5];

        finalMatrix[6] = beta * A[6] + (1.0 - beta) * R[6];
        finalMatrix[7] = beta * A[7] + (1.0 - beta) * R[7];
        finalMatrix[8] = beta * A[8] + (1.0 - beta) * R[8];

        // let compliance = 0.008 / (this.dt * this.dt);
        let compliance = 0.01 / (this.dt * this.dt);

        this.particles.forEach((joint, i) => {
            let goalPosition = q[i].clone().applyMatrix3(finalMatrix).add(this.centerOfMass).sub(joint.position);
            //joint.position.add(goalPosition.divide(2.0 + compliance));
            joint.position.add(goalPosition.divide(1 + compliance));
            joint.normal.applyMatrix3(finalMatrix).normalize();
        })
    }

    predictPosition() {

        const gravity = 9 * this.dt;
        this.particles.forEach(joint => {
            joint.prevPosition.copy(joint.position.clone());
            const acc = new Vec3();
            acc.y -= gravity;
            joint.velocity.add(acc);
            joint.position.add(joint.velocity.clone().multiply(this.dt));

        });

    }

    solveConstraints() {
        this.particles.forEach(joint => {
            if(joint.position.z < -2.0) joint.position.z = -2.0;
            if(joint.position.z > 2.0) joint.position.z = 2.0;

            if(joint.position.x < -4.2) joint.position.x = -4.2;
            if(joint.position.x > 4.2) joint.position.x = 4.2;

            if(joint.position.y < -0.65) joint.position.y = -0.65;
            if(joint.position.y > 5.2) joint.position.y = 5.2;
        });

    }

    updateVelocity() {

        this.particles.forEach(joint => {

            const currentVel = joint.position.clone().sub(joint.prevPosition);
            joint.velocity.copy(currentVel.divide(this.dt));
            if(joint.velocity.len() < 0.0001) joint.velocity.multiply(0);
            joint.velocity.multiply(0.998);

        });

    }

    update({time, deltaTime, camera} = {}) {

        if(!this.ready) return;

        for(let i = 0; i < this.SUBSTEPCOUNT; i++) {
            this.predictPosition();
            this.solveConstraints();

            this.centerOfMass = this.calcCenterOfMass();
            this.p = this.calcRelativePositions(this.centerOfMass);
            this.APQ = this.constructMatrix(this.p, this.q, new Mat3().copy(this.APQ));
            this.idealQuat = this.extractRotation(this.APQ, 50);

            this.applyGoalPositions(this.q);
            this.updateVelocity();
        }

        this.particles.forEach((particle, i) => {
            this.mesh.geometry.attributes.position.data[i * 3] = particle.position.x;
            this.mesh.geometry.attributes.position.data[i * 3 + 1] = particle.position.y;
            this.mesh.geometry.attributes.position.data[i * 3 + 2] = particle.position.z;
        });

        this.mesh.geometry.attributes.position.needsUpdate = true;
        this.mesh.geometry.attributes.normal.needsUpdate = true;

    }

    get Mesh() {
        return this.mesh;
    }

}
