import {Mesh, Vec3, Program, Transform, Mat4, Quat, Mat3} from 'ogl';
import {GLTFSkin} from "../../../../ogl/src/extras/GLTFSkin.js";

import {vertex} from './shader/vertex.js';
import fragment from './shader/fragment.frag?raw';

export default class RagDollMesh extends Transform {

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
                    this.mesh = new GLTFSkin(this.gl, {
                        skeleton: node.skeleton,
                        geometry: node.geometry,
                        program: this.createProgram(node)
                    });
                    this.joints = this.mesh.skeleton.joints;
                    console.log(this.joints);
                    this.mesh.setParent(this);
                    this.initShapeMatching();
                    // this.initConstraints();
                    //this.joints[6].velocity.add(new Vec3(2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5).multiply(50.0));
                    this.joints[12].velocity.add(new Vec3(2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5).multiply(0.01));
                    // this.joints[3].velocity.add(new Vec3(2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5).multiply(10.0));

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

    //TODO: DO A PASS ON THE CONSTRAINTS - SKIP IF DOING SHAPE MATCHING AS THERE IS NO NEED FOR CONNECTIVITY INFO THEN
    initConstraints() {

        // const {joints} = this.mesh.skeleton;
        // joints.forEach(joint => {
        //     console.log(joint);
        //     joint.velocity = new Vec3(0, 0, 0);
        //     joint.prevPosition = new Vec3();
        //     joint.correction = new Vec3();
        //     joint.p = new Vec3();
        //     joint.q = new Vec3();
        // });

        // console.log(joints);

        //joints[12].velocity.add(new Vec3(2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5).multiply(1));
        // joints[15].velocity.add(new Vec3(2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5).multiply(1));
        // joints[6].velocity.add(new Vec3(2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5, 2.0 * Math.random()-0.5).multiply(0.0));

        //here we go...
        // this.constraints[0] = this.createConstraint(joints[5], joints[6], 1, 1);
        // this.constraints[1] = this.createConstraint(joints[5], joints[4], 1, 1);

        this.constraints[0] = this.createConstraint(joints[3], joints[10]);
        this.constraints[1] = this.createConstraint(joints[4], joints[11]);
        this.constraints[2] = this.createConstraint(joints[5], joints[12]);

        this.constraints[3] = this.createConstraint(joints[3], joints[4]);
        this.constraints[4] = this.createConstraint(joints[10], joints[11]);
        this.constraints[5] = this.createConstraint(joints[4], joints[5]);
        this.constraints[6] = this.createConstraint(joints[11], joints[12]);

        this.constraints[7] = this.createConstraint(joints[3], joints[11]);
        this.constraints[8] = this.createConstraint(joints[10], joints[4]);
        this.constraints[9] = this.createConstraint(joints[4], joints[12]);
        this.constraints[10] = this.createConstraint(joints[11], joints[5]);

        this.constraints[11] = this.createConstraint(joints[5], joints[6]);
        this.constraints[12] = this.createConstraint(joints[12], joints[13]);

        this.constraints[13] = this.createConstraint(joints[5], joints[14]);
        this.constraints[14] = this.createConstraint(joints[12], joints[14]);
        this.constraints[15] = this.createConstraint(joints[14], joints[15]);
        this.constraints[16] = this.createConstraint(joints[4], joints[14]);
        this.constraints[17] = this.createConstraint(joints[11], joints[14]);

        this.constraints[18] = this.createConstraint(joints[2], joints[1]);
        this.constraints[19] = this.createConstraint(joints[1], joints[0]);

        //left leg
        this.constraints[20] = this.createConstraint(joints[9], joints[8]);
        this.constraints[21] = this.createConstraint(joints[8], joints[7]);

        this.constraints[22] = this.createConstraint(joints[0], joints[7]);
        this.constraints[23] = this.createConstraint(joints[0], joints[10]);
        this.constraints[24] = this.createConstraint(joints[7], joints[3]);

        this.constraints[25] = this.createConstraint(joints[0], joints[3]);
        this.constraints[26] = this.createConstraint(joints[7], joints[10]);


    }

    initShapeMatching() {

        console.log(this.mesh.geometry);
        this.joints.forEach(joint => {
            joint.updateMatrixWorld();
            //joint.position.applyMatrix4(joint.worldMatrix)
        })

        this.joints.forEach(joint => {
            joint.velocity = new Vec3(0, 0, 0);
            joint.prevPosition = new Vec3();
            joint.correction = new Vec3();
            joint.p = new Vec3();
            joint.q = new Vec3();
        });

        this.initCenterOfMass = this.calcCenterOfMass(true);
        this.q = this.calcRelativePositions(this.initCenterOfMass);

        this.centerOfMass = this.calcCenterOfMass();
        this.p = this.calcRelativePositions(this.centerOfMass);

        // this.constructMatrix(this.q, this.q, this.AQQ, true);
        // this.constructMatrix(this.p, this.q, this.APQ, false);
    }

    calcCenterOfMass(isInit = false) {
        let tmp = new Vec3();
        this.joints.forEach(joint => {
            joint.updateMatrixWorld();
            tmp.add(joint.position.clone());
        });
        tmp.divide(this.joints.length);
        return tmp;
    }

    calcRelativePositions(cm) {
        let _pos = [];
        this.joints.forEach((joint, i) => {
            joint.updateMatrixWorld();
            _pos.push(joint.position.clone().sub(cm));
        });
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

        //isQQ && A.inverse(); //based on recent logs, this might blow up

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

        let omegaAxis = new Quat();

        let w = 0;

        let eps = 1.0e-9;

        let R = new Mat3();

        if(this.firstTick) {
            this.firstTick = false;
            quat = new Quat().fromMatrix3(A);
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

            w = omega.len()
            if(w < eps) break;

            // w = Math.sqrt(w);

            omegaAxis = new Quat().fromAxisAngle(omega.multiply(1.0 / w), w);
            let tmp = new Quat().multiply(omegaAxis, quat);
            tmp.normalize();
            quat.copy(tmp);

        }

        return quat.normalize();

    }

    calculateRotationMatrix() {
        //this.idealQuat = this.extractRotation(this.APQ, 20);
        // this.A.multiply(this.APQ, this.AQQ);
    }

    applyGoalPositions(q) {
        this.joints.forEach((joint, i) => {
            let goalPosition = q[i].clone().applyQuaternion(this.idealQuat).add(this.centerOfMass).sub(joint.position);
            joint.position.add(goalPosition.multiply(0.0001));
            joint.updateMatrixWorld();
        })
    }

    predictPosition() {

        const gravity = 9 * this.dt;
        this.joints.forEach(joint => {

            joint.prevPosition.copy(joint.position.clone());

            const acc = new Vec3();
            acc.z += gravity;
            joint.velocity.sub(acc);
            joint.position.add(joint.velocity.clone().multiply(this.dt));
            joint.updateMatrixWorld();

        });

    }

    solveConstraints() {

        //constrain to floor
        const {joints} = this.mesh.skeleton;
        this.joints.forEach(joint => {

            const neighbours = joints.filter(j => j !== joint);

            // neighbours.forEach(neighbour => {
            //
            //     const dir = neighbour.position.clone().sub(joint.position);
            //     const length = dir.len();
            //     if(length > 0.0 && length < 0.005) {
            //         dir.normalize();
            //         const correction  = (0.005 - length) * 0.5;
            //         const correctionDir = dir.multiply(correction);
            //         joint.position.add(correctionDir);
            //         neighbour.position.add(correctionDir.clone().multiply(-1));
            //     }
            //
            // })

            //joint.position.add(_correctionDir.divide(count));
            joint.updateMatrixWorld();

            if(joint.position.z < -0.5) joint.position.z = -0.5;
            if(joint.position.z > 3.0) joint.position.z = 3.0;

            if(joint.position.x < -1.2) joint.position.x = -1.2;
            if(joint.position.x > 1.2) joint.position.x = 1.2;

            if(joint.position.y < -1.2) joint.position.y = -1.2;
            if(joint.position.y > 1.2) joint.position.y = 1.2;
            joint.updateMatrixWorld();

        });

        // return;
        // //maintain restlenghts
        // this.constraints.forEach(constraint => {
        //
        //     //get direction
        //     let dir = new Vec3().sub(constraint.b.position, constraint.a.position);
        //     const dist = dir.len();
        //     if(dist === 0) return;
        //     // if(dist > 0.0) {
        //         dir = dir.divide(dist);
        //         const C = dist - constraint.restLength;
        //         const totalMass = 1.0 / (constraint.m1 + constraint.m2);
        //         // const s = C / (totalMass + (0.0 / (this.dt * this.dt)));
        //         const s = C * totalMass;
        //         constraint.correctionA.copy(dir.clone().multiply(s).multiply(constraint.m1));
        //         constraint.a.position.add(constraint.correctionA);
        //         constraint.correctionB.copy(dir.clone().multiply(-s).multiply(constraint.m2));
        //         constraint.b.position.add(constraint.correctionB);
        //     // }
        //
        // });

    }

    updateVelocity() {

        this.joints.forEach(joint => {

            const currentVel = joint.position.clone().sub(joint.prevPosition);
            joint.velocity.copy(currentVel.divide(this.dt));
            //joint.velocity.multiply(0.9997);

        });

    }

    update({time, deltaTime, camera} = {}) {

        if(!this.ready) return;
        for(let i = 0; i < this.SUBSTEPCOUNT; i++) {

            this.predictPosition();

            this.joints.forEach(joint => {joint.updateMatrixWorld();})

            this.centerOfMass = this.calcCenterOfMass();
            this.p = this.calcRelativePositions(this.centerOfMass);
            this.APQ = this.constructMatrix(this.p, this.q, new Mat3().copy(this.APQ));

            // this.calculateRotationMatrix();
            this.idealQuat = this.extractRotation(this.APQ, 150);

            this.applyGoalPositions(this.q);

            this.solveConstraints();

            this.updateVelocity();

        }

        this.joints.forEach(joint => {
            joint.updateMatrixWorld();
            //joint.position.applyMatrix4(joint.worldMatrix)
        })

    }

    get Mesh() {
        return this.mesh;
    }

}
