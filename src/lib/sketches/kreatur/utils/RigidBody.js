import {Euler, Mat3, Quat, Vec3} from "ogl";

export default class RigidBody {
    constructor(obj, {
        naive = true,
        maxForce = 1,
        maxVel = 7,
        maxRotationSpeed = 7,
        inertia = 0.93,
        rotationInertia = 0.93,
        mass = 1.0
    } = {}) {
        this.obj = obj;

        //rotational forces..
        this.rotationalForces = new Mat3();

        this.acc = new Vec3();
        this.vel = new Vec3();

        this.torque = new Vec3();
        this.angularVelocity = new Vec3();

        this.totalForce = new Vec3();

        this.totalTorque = new Vec3();
        this.totalTorqueNaive = new Vec3();
        this.naiveRotation = new Euler();
        this.naiveQuat = new Quat();

        this.mass = mass;
        this.intertia = inertia;
        this.rotationInertia = rotationInertia;

        //for applying non-physically correct rules to apply visually
        //plausible physics
        //NOTE: this is more concerning torques and angular velocity
        this.naiveMode = naive;

        this.maxForce = maxForce;
        this.maxVel = maxVel;

    }

    applyTorque({direction} = {}) {}

    addAngularVelocity(F) {
        //magnitude of resulting vector determines the amount of rotation
        const angularVel = new Vec3().cross(this.obj.forward, F);
        const axis = angularVel.clone().normalize();
        this.obj.quaternion.fromAxisAngle(axis, angularVel.len());
        // this.obj.rotation.fromQuaternion(this.obj.quaternion);
    }

    addForce(F) {
        this.acc.add(F);
    }

    addTorqueNaive(F) {
        this.torque.add(F);
    }

    updateVelocity() {
        this.vel.add(this.totalForce);

        if(this.naiveMode) {
            this.obj.position.add(this.vel);
            this.vel.multiply(this.intertia);
            return;
        }

        //more physically correct..
        this.limit(this.vel, this.maxVel);
        this.obj.position.add(this.vel);

    }

    updateAngularVelocityNaive() {
        this.angularVelocity.add(this.totalTorqueNaive);
        this.naiveRotation.x += this.angularVelocity.x;
        this.naiveRotation.y += this.angularVelocity.y;
        this.naiveRotation.z += this.angularVelocity.z;

        this.naiveQuat.fromEuler(this.naiveRotation);

        this.obj.rotation.fromQuaternion(this.naiveQuat);

        // this.obj.rotation.x += this.angularVelocity.x;
        // this.obj.rotation.y += this.angularVelocity.y;
        // this.obj.rotation.z += this.angularVelocity.z;

        this.angularVelocity.multiply(this.rotationInertia);
    }

    updateAngularVelocity() {
        if(this.naiveMode) {
            this.updateAngularVelocityNaive();
            return;
        }
    }

    resetForces() {
        this.acc.multiply(0);
        this.torque.multiply(0);
        this.totalForce.multiply(0);
        this.totalTorque.multiply(0);
        this.totalTorqueNaive.multiply(0);
    }

    update() {
        //linear forces
        this.totalForce.add(this.acc);
        this.updateVelocity();
        //rotational forces
        if(this.naiveMode) {
            this.totalTorqueNaive.add(this.torque);
            this.updateAngularVelocityNaive();
        } else {
            this.totalTorque.add(this.torque)
            this.updateAngularVelocity();
        }

        this.resetForces();

    }

    limit(v, max) {
        //more physically correct..
        const mag = v.len();
        (mag > max) && v.normalize().scale(max);
    }

}
