import {Mesh, Program, Sphere, Transform, Vec3, Vec4} from "ogl";

import testMeshVS from './testMesh/testMesh.vert?raw';
import testMeshFS from './testMesh/testMesh.frag?raw';

export default class Body extends Transform {
    constructor(gl) {
        super();

        this.gl = gl;

        //params
        this.prevPosition = new Vec3();
        this.prevRotation = new Vec4();

        this.velocity = new Vec3();
        this.desiredLocation = new Vec3();
        this.desiredVelocity = new Vec3();
        this.steerForce = new Vec3();
        this.acc = new Vec3();

        this.maxSpeed = 0.05;
        this.maxForce = 0.01;

        this.forward = new Vec3(0.0, 0.0, -1.0);

        //steering
        this.target = new Vec3();

        this.initTestMesh();

        this.numPoints = 42;

        this.roots = this.generateroots();
        this.rootPositions = new Array(this.roots.length);

        for(let i = 0; i < this.roots.length; i++) {
            const p = new Mesh(this.gl, {
                geometry: new Sphere(this.gl, {radius: 0.1}),
                program: new Program(this.gl, {
                    vertex: testMeshVS,
                    fragment: testMeshFS,
                    uniforms: {
                        uColorMode: {value: 0}
                    }
                })
            });

            p.position.clone(p.position);
            this.debugMesh.addChild(p);
        }

        this.generateroots();

    }

    generateroots() {
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians
        const points = [];

        for (let i = 0; i < this.numPoints ; i++) {

            const phase = i / (this.numPoints - 1);
            const latitude = Math.asin(1 - (2.0 * phase)); // Distribute between -π/2 and π/2
            const longitude = goldenAngle * i;
            const r = 0.2;
            const x = Math.cos(longitude) * Math.cos(latitude) * r;
            const y = Math.sin(longitude) * Math.cos(latitude) * r;
            const z = Math.sin(latitude) * r;

            // const p = {
            //     position: new Vec3(x, y, z),
            //     worldPosition: new Vec3(x, y, z)
            // }
            const p = new Transform();
            p.position.set(x,y,z);
            p.worldPosition = new Vec3(x, y, z);

            points.push(p);
        }

        return points;
    }

    initTestMesh() {

        const uniforms = {
            uColorMode: {value: 0}
        }

        // this.debugMesh = new Mesh(this.gl, {
        //     geometry: new Sphere(this.gl, {radius: 0.5}),
        //     program: new Program(this.gl, {
        //         vertex: testMeshVS,
        //         fragment: testMeshFS,
        //         uniforms: {
        //             uColorMode: {value: 1}
        //         }
        //     })
        // });

        this.debugMesh = new Transform();

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

        this.addChild(this.targetDebug);

    }

    //TODO: repalce debug mesh position with this transforms position
    update(t, dt) {
        this.updateTarget(t);
        this.updateOrientation();
        this.spin(dt);
        this.steer();
        this.updateRootWorldPositions()
    }

    updateTarget(t) {

        const offset = Math.sin(t * 0.0001) * 0.5 + 0.5;
        const speed = 0.0015;
        const radius = 2;

        this.target.x = Math.cos(t * speed) * radius * 2.0;
        this.target.y = Math.sin(t * speed * 1.5) * radius;
        this.target.z = Math.sin(t * speed) * radius * 2.0;

        this.targetDebug.position = this.target;
    }

    //lookat doesn;t look great due to looking at target...
    //infer from current and prev position to determine orientation
    updateOrientation() {
        this.debugMesh.lookAt(this.target);
    }

    spin(dt) {
        //this.forward.applyQuaternion(this.debugMesh.quaternion);
        // this.debugMesh.rotation.x = t * 0.001;
        // this.debugMesh.rotation.y = t * 0.005;
    }

    steer() {

        this.prevPosition.clone(this.debugMesh.position);
        this.desiredVelocity = this.target.clone().sub(this.debugMesh.position);
        this.desiredVelocity.normalize().scale(this.maxSpeed);
        const steer = this.desiredVelocity.sub(this.velocity);
        if(steer.len() > this.maxForce) steer.normalize().scale(this.maxForce);

        this.acc.add(steer);
        this.velocity.add(this.acc);

        this.debugMesh.position.add(this.velocity);

        this.acc.multiply(0.0);

    }

    updateRootWorldPositions() {

        this.roots.forEach((root, i) => {
            root.updateMatrixWorld();
            const worldP = root.position.clone().applyMatrix4(this.debugMesh.worldMatrix);
            root.worldPosition.clone(worldP);
            // this.rootPositions[i] = root.worldPosition;
            this.rootPositions[i] = worldP;
        });

    }

}
