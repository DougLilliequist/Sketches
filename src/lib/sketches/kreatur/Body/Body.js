import {Euler, Mesh, Program, Quat, Sphere, Transform, Vec3, Vec4} from "ogl";

import testMeshVS from './testMesh/testMesh.vert?raw';
import testMeshFS from './testMesh/testMesh.frag?raw';
import RigidBody from "$lib/sketches/kreatur/utils/RigidBody.js";

export default class Body extends Transform {
    constructor(gl) {
        super();

        this.gl = gl;

        //params
        this.prevPosition = new Vec3();
        this.prevRotation = new Vec3();

        this.velocity = new Vec3();
        this.desiredLocation = new Vec3();
        this.desiredVelocity = new Vec3();

        this.prevAngularVelocity = new Vec3();

        this.steerForce = new Vec3();
        this.acc = new Vec3();

        // this.maxSpeed = 0.0035;
        this.maxSpeed = 0.025;
        // this.maxSpeed = 0.0135;
        this.maxForce = 0.001;

        this.forward = new Vec3(0.0, 0.0, -1.0);

        //steering
        this.target = new Vec3();

        this.initTestMesh();

        this.numPoints = 80;

        this.rootsTransform = new Transform();
        this.addChild(this.rootsTransform);

        this.roots = this.generateRoots();
        this.rootPositions = new Array(this.roots.length);

        for(let i = 0; i < this.roots.length; i++) {
            const p = new Mesh(this.gl, {
                geometry: new Sphere(this.gl, {radius: 0.01}),
                program: new Program(this.gl, {
                    vertex: testMeshVS,
                    fragment: testMeshFS,
                    uniforms: {
                        uColorMode: {value: 0}
                    }
                })
            });

            // this.roots[i].addChild(p);
        }

        this.rigidBody = new RigidBody(this.debugMesh, {naive: false, maxVel: this.maxSpeed});
        this.rootsTransformRigidBody = new RigidBody(this.rootsTransform, {rotationInertia: 0.99});

    }

    generateRoots() {

        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
        const points = [];

        if(this.numPoints < 2) {
            const p = new Transform();
            p.position.set(0, 0, 0);
            p.worldPosition = new Vec3(0, 0, 0);

            points.push(p);
            return points;
        }

        for (let i = 0; i < this.numPoints ; i++) {

            const phase = i / (this.numPoints - 1);
            const latitude = Math.asin(1 - (2.0 * phase)); // Distribute between -π/2 and π/2
            const longitude = goldenAngle * i;
            // const r = 0.1;
            const r = 0.05;
            const x = Math.cos(longitude) * Math.cos(latitude) * r;
            const y = Math.sin(longitude) * Math.cos(latitude) * r;
            const z = Math.sin(latitude) * r;

            const p = new Transform();
            p.position.set(x,y,z);
            p.worldPosition = new Vec3(x, y, z);
            this.rootsTransform.addChild(p);

            points.push(p);
        }

        return points;
    }

    initTestMesh() {

        const uniforms = {
            uColorMode: {value: 0}
        }

        this.debugMesh = new Mesh(this.gl, {
            geometry: new Sphere(this.gl, {radius: 0.0*0.5}),
            program: new Program(this.gl, {
                vertex: testMeshVS,
                fragment: testMeshFS,
                uniforms: {
                    uColorMode: {value: 1}
                }
            })
        });

        // this.debugMesh = new Transform();

        this.addChild(this.debugMesh);

        this.targetDebug = new Mesh(this.gl, {
            geometry: new Sphere(this.gl, {radius: 0.1}),
            program: new Program(this.gl, {
                vertex: testMeshVS,
                fragment: testMeshFS,
                uniforms: {
                    uColorMode: {value: 0}
                }
            })
        });

        // this.addChild(this.targetDebug);

    }

    //TODO: repalce debug mesh position with this transforms position
    update(t, dt) {

        this.storePreviousTransforms();
        this.updateTarget(t);
        this.steer();
        this.updateOrientation();
        this.spin();
        this.applyFakeGyroscopicForce();

        this.rigidBody.update();
        this.rootsTransformRigidBody.update();
        this.updateRootWorldPositions();
    }

    updateTarget(t) {

        const offset = Math.sin(t * 0.0001) * 0.5 + 0.5;
        const speed = 0.0015;

        this.target.x = Math.cos(t * speed) * Math.sin((t * 0.0015) + 23123) * 4.0;
        this.target.y = Math.sin(t * speed * 0.5) * Math.sin((t * 0.0015) + 12312.0) * 4;
        this.target.z = Math.sin(t * speed) * Math.sin((t * 0.0015) + 9432.012) * 4.0;

        this.targetDebug.position = this.target;
    }

    //lookat doesn;t look great due to looking at target...
    //infer from current and prev position to determine orientation
    updateOrientation() {
        this.debugMesh.lookAt(this.target);
    }

    spin() {
        const forward = new Vec3(this.debugMesh.worldMatrix[8], this.debugMesh.worldMatrix[9], this.debugMesh.worldMatrix[10]);
        const spinRotation = new Quat().fromAxisAngle(forward, this.rigidBody.vel.len() * 0.02);
        const naiveRotation = new Euler().fromQuaternion(spinRotation);
        this.rootsTransformRigidBody.addTorqueNaive(naiveRotation);
    }

    applyFakeGyroscopicForce() {
        const {rotation} = this.debugMesh;
        const desiredAngularVel = new Vec3(rotation.x, rotation.y, rotation.z).sub(this.prevRotation);
        desiredAngularVel.normalize().scale(0.025);
        const steer = desiredAngularVel.sub(this.rootsTransformRigidBody.angularVelocity);
        if(steer.len() > this.maxForce) steer.normalize().scale(0.001);
        // const angularForce = desiredAngularVel.sub(this.prevAngularVelocity);
        this.rootsTransformRigidBody.addTorqueNaive(steer);
        this.prevAngularVelocity.copy(desiredAngularVel);
    }

    storePreviousTransforms() {
        this.prevPosition.clone(this.debugMesh.position);
        this.prevRotation.set(this.debugMesh.rotation.x, this.debugMesh.rotation.y, this.debugMesh.rotation.z);
    }

    steer() {
        this.desiredVelocity = this.target.clone().sub(this.debugMesh.position);
        this.desiredVelocity.normalize().scale(this.maxSpeed);
        const steer = this.desiredVelocity.sub(this.rigidBody.vel);
        if(steer.len() > this.maxForce) steer.normalize().scale(this.maxForce);
        this.rigidBody.addForce(steer);
    }

    updateRootWorldPositions() {

        this.rootsTransform.position.copy(this.debugMesh.position);
        this.roots.forEach((root, i) => {
            root.updateMatrixWorld();
            const worldP = root.position.clone().applyMatrix4(this.rootsTransform.worldMatrix);
            root.worldPosition.clone(worldP);
            //this.rootPositions[i] = root.worldPosition;
            this.rootPositions[i] = worldP;
        });

    }

}
