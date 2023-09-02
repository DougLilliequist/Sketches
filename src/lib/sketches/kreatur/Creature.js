import Body from "./Body/Body.js";
import TentacleSimulator from "./tentacles/tentacleSimulator.js";
import {Transform, Vec2} from "ogl";
import TentacleMesh from "$lib/sketches/kreatur/tentacles/tentacleMesh.js";

export default class Creature extends Transform {
    constructor(gl) {
        super();
        this.gl = gl;

        this.body = new Body(this.gl);
        this.addChild(this.body);

        this.tentacleMesh = new TentacleMesh(this.gl, {
            rootPositions: this.body.rootPositions,
            // resolutionCount: new Vec2(125, this.body.rootPositions.length),
            resolutionCount: new Vec2(256, this.body.rootPositions.length),
            tentacleResolution: 8
        })

        this.addChild(this.tentacleMesh);

    }

    update(t) {
        this.body.update(t);
        this.tentacleMesh.update({rootPositions: this.body.rootPositions, bodyPos: this.body.debugMesh.position})
    }

}
