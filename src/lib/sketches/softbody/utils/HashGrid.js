
//based on following work:
//https://github.com/matthias-research/pages/blob/master/tenMinutePhysics/11-hashing.html
export class HashGrid {
    constructor(spacing, maxNumObjects)
    {
        this.spacing = spacing;
        this.tableSize = 2 * maxNumObjects;
        this.cellStart = new Int32Array(this.tableSize + 1);
        this.cellEntries = new Int32Array(maxNumObjects);
        this.queryIds = new Int32Array(maxNumObjects);
        this.querySize = 0;
    }

    hashCoords(xi, yi, zi) {
        let h = (xi * 92837111) ^ (yi * 689287499) ^ (zi * 283923481);	// fantasy function
        return Math.abs(h) % this.tableSize;
    }

    intCoord(coord) {
        return Math.floor(coord / this.spacing);
    }

    hashPos(pos, nr) {
        return this.hashCoords(
            this.intCoord(pos[3 * nr]),
            this.intCoord(pos[3 * nr + 1]),
            this.intCoord(pos[3 * nr + 2]));
    }

    create(pos) {
        let numObjects = Math.min(pos.length / 3, this.cellEntries.length);

        // determine cell sizes

        this.cellStart.fill(0);
        this.cellEntries.fill(0);

        for (let i = 0; i < numObjects; i++) {
            let h = this.hashPos(pos, i);
            this.cellStart[h]++;
        }

        // determine cells starts

        let start = 0;
        for (let i = 0; i < this.tableSize; i++) {
            start += this.cellStart[i];
            this.cellStart[i] = start;
        }
        this.cellStart[this.tableSize] = start;	// guard

        // fill in objects ids

        for (let i = 0; i < numObjects; i++) {
            let h = this.hashPos(pos, i);
            this.cellStart[h]--;
            this.cellEntries[this.cellStart[h]] = i;
        }
    }

    query(pos, nr, maxDist) {
        let x0 = this.intCoord(pos[3 * nr] - maxDist);
        let y0 = this.intCoord(pos[3 * nr + 1] - maxDist);
        let z0 = this.intCoord(pos[3 * nr + 2] - maxDist);

        let x1 = this.intCoord(pos[3 * nr] + maxDist);
        let y1 = this.intCoord(pos[3 * nr + 1] + maxDist);
        let z1 = this.intCoord(pos[3 * nr + 2] + maxDist);

        this.querySize = 0;

        for (let xi = x0; xi <= x1; xi++) {
            for (let yi = y0; yi <= y1; yi++) {
                for (let zi = z0; zi <= z1; zi++) {
                    let h = this.hashCoords(xi, yi, zi);
                    let start = this.cellStart[h];
                    let end = this.cellStart[h + 1];

                    for (let i = start; i < end; i++) {
                        this.queryIds[this.querySize] = this.cellEntries[i];
                        this.querySize++;
                    }
                }
            }
        }
    }
};
