import { Geometry, Vec3 } from 'ogl';

export class Sphere extends Geometry {
    constructor(
        gl,
        {
            radius = 0.5,
            widthSegments = 16,
            heightSegments = Math.ceil(widthSegments * 0.5),
            phiStart = 0,
            phiLength = Math.PI * 2,
            thetaStart = 0,
            thetaLength = Math.PI,
            attributes = {},
        } = {}
    ) {
        const wSegs = widthSegments;
        const hSegs = heightSegments;
        const pStart = phiStart;
        const pLength = phiLength;
        const tStart = thetaStart;
        const tLength = thetaLength;

        const num = (wSegs + 1) * (hSegs + 1);
        const numIndices = wSegs * hSegs * 6;

        const position = new Float32Array(num * 3);
        const normal = new Float32Array(num * 3);
        const tangent = new Float32Array(num * 3);
        const binormal = new Float32Array(num * 3);
        const uv = new Float32Array(num * 2);
        const index = num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices);

        let i = 0;
        let iv = 0;
        let ii = 0;
        let te = tStart + tLength;
        const grid = [];

        let n = new Vec3();
        let t = new Vec3();
        let b = new Vec3();

        const halfPI = Math.PI * 0.5;

        for (let iy = 0; iy <= hSegs; iy++) {
            let vRow = [];
            let v = iy / hSegs;
            for (let ix = 0; ix <= wSegs; ix++, i++) {
                let u = ix / wSegs;
                let x = -radius * Math.cos(pStart + u * pLength) * Math.sin(tStart + v * tLength);
                let y = radius * Math.cos(tStart + v * tLength);
                let z = radius * Math.sin(pStart + u * pLength) * Math.sin(tStart + v * tLength);

                position[i * 3] = x;
                position[i * 3 + 1] = y;
                position[i * 3 + 2] = z;

                n.set(x, y, z).normalize();
                normal[i * 3] = n.x;
                normal[i * 3 + 1] = n.y;
                normal[i * 3 + 2] = n.z;

                // const tangentX = -Math.cos((pStart + u * pLength)+halfPI) * Math.sin(tStart + v * tLength);
                // const tangentY = 0;
                // const tangentZ = Math.sin((pStart + u * pLength)+halfPI) * Math.sin(tStart + v * tLength);

                const tangentX = -Math.cos((pStart + u * pLength)+halfPI);
                const tangentY = 0;
                const tangentZ = Math.sin((pStart + u * pLength)+halfPI);

                t.set(tangentX, tangentY, tangentZ).normalize();
                tangent[i * 3] = t.x;
                tangent[i * 3 + 1] = t.y;
                tangent[i * 3 + 2] = t.z;

                b.copy(n).cross(t).normalize();

                binormal[i * 3] = b.x;
                binormal[i * 3 + 1] = b.y;
                binormal[i * 3 + 2] = b.z;

                uv[i * 2] = u;
                uv[i * 2 + 1] = 1 - v;

                vRow.push(iv++);
            }

            grid.push(vRow);
        }

        for (let iy = 0; iy < hSegs; iy++) {
            for (let ix = 0; ix < wSegs; ix++) {
                let a = grid[iy][ix + 1];
                let b = grid[iy][ix];
                let c = grid[iy + 1][ix];
                let d = grid[iy + 1][ix + 1];

                if (iy !== 0 || tStart > 0) {
                    index[ii * 3] = a;
                    index[ii * 3 + 1] = b;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
                if (iy !== hSegs - 1 || te < Math.PI) {
                    index[ii * 3] = b;
                    index[ii * 3 + 1] = c;
                    index[ii * 3 + 2] = d;
                    ii++;
                }
            }
        }

        Object.assign(attributes, {
            position: { size: 3, data: position },
            normal: { size: 3, data: normal },
            tangent: {size: 3, data: tangent},
            binormal: {size: 3, data: binormal},
            uv: { size: 2, data: uv },
            index: { data: index },
        });

        super(gl, attributes);
    }
}