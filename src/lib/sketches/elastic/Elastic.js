Class(function Elastic({ applyClustering = true } = {}) {
    Inherit(this, Object3D);
    const _this = this;


    let _positionBuffer, _initRelativePositionBuffer, _relativePositionBuffer,
        _velocityBuffer, _solvedPositionBuffer, _normalBuffer, _copyBuffer,
        _initPositionsBuffer, _interactionDataBuffer;
    let _predictedPosition, _prevPosition;

    let _clusterDebugBuffer, _clusterDataBuffer;

    let _currentCenterOfMassBuffer, _initCenterOfMassBuffer;

    //MRT's and textures used for constructing required matrices
    let _apqBuffer, _aqqBuffer, _optimalRotationBuffer;
    let _apqBuffer0, _apqBuffer1, _apqBuffer2;
    let _aqqBuffer0, _aqqBuffer1, _aqqBuffer2;

    let _apqColA, _apqColB, _apqColC;
    let _aqqColA, _aqqColB, _aqqColC;
    let _optimalRotationColA, _optimalRotationColB, _optimalRotationColC;

    let _textureSize;

    let _predictPositionProgram, _relativePositionProgram, _solvePositionProgram,
        _velocityUpdateProgram, _normalUpdateProgram, _applyGoalPositionProgram, _initPosConstraintProgram;

    let _matrixSetupProgram, _matrixConstructionProgram;
    let _copyDataProgram;
    let _initPositionsProgram, _interactionProgram;
    let _summationProgram;

    let _clusterProgram;
    let _clusterTileCount, _clusterDataSize, _clusterSliceSize, _subDivisionSize, _bucketCount;

    let _refGeometry, _vertexCount;
    let _clusterDataGeometry;

    let _meshData, _outputMesh;
    let _projector;

    let _hitPoint = new Vector3();

    let _gpuIntersect;

    // let _rayCaster = new Raycaster(World.CAMERA);
    let _rayCaster = new RayManager();

    const SUB_STEP_COUNT = 15;
    //const dt = 0.0016 / SUB_STEP_COUNT;
    const dt = (1 / 120) / SUB_STEP_COUNT;
    // const dt = (1 / 120);
    // const dt = (1 / 60);

    //*** Constructor
    (async function () {
        _this.flag('firstTick', true);
        await init();

        addHandlers();

        _this.startRender(loop);
    })();

    async function init() {
        let promise = Promise.create();

        _refGeometry = await GeomThread.loadGeometry('./assets/geometry/head.json');
        // _refGeometry = new SphereGeometry(0.5, 128, 128);
        _refGeometry.computeBoundingBox();
        _vertexCount = _refGeometry.attributes.position.array.length / 3;

        //borrowing from OGL to determine smallest Po2, this is to ensure no goofy com's
        //TODO: test if I can make this work with non-po2 size
        _textureSize = Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(_vertexCount))) / Math.LN2));

        _meshData = _this.initClass(MeshData, _refGeometry, _textureSize);
        _outputMesh = _this.initClass(OutputMesh, _refGeometry, _textureSize);

        if (applyClustering) initClusters();
        initTextures();
        initPrograms();

        return promise.resolve();
    }

    function initClusters() {
        _subDivisionSize = 2;
        let { min, max } = _refGeometry.boundingBox;
        const buckets = [];
        // let overlap = 0.0625;
        let overlap = 0.2;
        const vertexCount = _refGeometry.attributes.position.array.length / 3;

        const bucketSizeX = Math.abs(max.x - min.x) / _subDivisionSize;
        const bucketSizeY = Math.abs(max.y - min.y) / _subDivisionSize;
        const bucketSizeZ = Math.abs(max.z - min.z) / _subDivisionSize;

        // const overlapFraction = 0.333;
        // const overlapFraction = 0.555;
        // const overlapFraction = (1 / _subDivisionSize);
        // const overlapFraction = 0.555;
        // const overlapFraction = 0.555;
        const overlapFraction = 0.35;
        const overlapX = bucketSizeX * overlapFraction;
        const overlapY = bucketSizeY * overlapFraction;
        const overlapZ = bucketSizeZ * overlapFraction;

        //initalise buckets
        for (let z = 0; z < _subDivisionSize; z++) {
            for (let y = 0; y < _subDivisionSize; y++) {
                for (let x = 0; x < _subDivisionSize; x++) {
                    const voxelBoundsX = {};
                    voxelBoundsX.min = Math.map(x, 0, _subDivisionSize, min.x, max.x) - overlapX;
                    voxelBoundsX.max = Math.map(x + 1, 0, _subDivisionSize, min.x, max.x) + overlapX;

                    const voxelBoundsY = {};
                    voxelBoundsY.min = Math.map(y, 0, _subDivisionSize, min.y, max.y) - overlapY;
                    voxelBoundsY.max = Math.map(y + 1, 0, _subDivisionSize, min.y, max.y) + overlapY;

                    const voxelBoundsZ = {};
                    voxelBoundsZ.min = Math.map(z, 0, _subDivisionSize, min.z, max.z) - overlapZ;
                    voxelBoundsZ.max = Math.map(z + 1, 0, _subDivisionSize, min.z, max.z) + overlapZ;

                    let bucket = [];

                    for (let i = 0; i < vertexCount; i++) {
                        let x = _refGeometry.attributes.position.getX(i);
                        let y = _refGeometry.attributes.position.getY(i);
                        let z = _refGeometry.attributes.position.getZ(i);

                        let inBoundsX = x >= voxelBoundsX.min && x <= voxelBoundsX.max;
                        let inBoundsY = y >= voxelBoundsY.min && y <= voxelBoundsY.max;
                        let inBoundsZ = z >= voxelBoundsZ.min && z <= voxelBoundsZ.max;

                        if (inBoundsX && inBoundsY && inBoundsZ) {
                            bucket.push(i);
                        }
                    }
                    buckets.push(bucket);
                }
            }
        }
        let rootBucket = [];
        for (let i = 0; i < vertexCount; i++) rootBucket.push(i);
        buckets.push(rootBucket);
        _bucketCount = buckets.length;

        //create bucket geometry

        //TODO: use this approach for making smaller tiles.

        // //determine texture size for the clustering
        let bucketDataCount = 0;
        buckets.forEach(bucket => bucketDataCount += bucket.length);
        // let bucketDataSize = Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(bucketDataCount))) / Math.LN2));
        // //find largest bucket and determine slice size
        // let sortedBuckets = buckets.sort((a, b) => b.length - a.length);
        // let sliceSize = Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(sortedBuckets[0].length))) / Math.LN2));

        //find the vertex with the largest index and use that to determine slice size
        const largestIndex = _refGeometry.index.slice().sort((a, b) => b - a)[0];
        let sliceSize = Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(largestIndex))) / Math.LN2));
        _clusterSliceSize = sliceSize;

        const tileCount = Math.pow(2, Math.ceil(Math.log(Math.ceil(Math.sqrt(Math.pow(_subDivisionSize, 3) + 1))) / Math.LN2));
        _clusterTileCount = tileCount;
        const bucketDataSize = tileCount * sliceSize;
        _clusterDataSize = bucketDataSize;

        const sliceCount = bucketDataSize / sliceSize;
        const sliceScale = sliceSize / bucketDataSize;
        let bucketData = [];
        let bucketDataCountData = [];

        buckets.forEach((bucket, bucketIndex) => {
            bucket.forEach((vertexID) => {
                let offsetX = (bucketIndex % sliceCount) / sliceCount;
                let offsetY = Math.floor(bucketIndex / sliceCount) / sliceCount;

                let x = ((vertexID % sliceSize) + 0.5) / sliceSize;
                x = offsetX + x * sliceScale;

                let y = (Math.floor(vertexID / sliceSize) + 0.5) / sliceSize;
                y = offsetY + y * sliceScale;

                bucketData.push(x);
                bucketData.push(y);
                bucketData.push(vertexID);
                bucketData.push(bucketIndex); //need this for computing center of mass

                bucketDataCountData.push(bucket.length);
            });
        });

        //NOTE: the following geometry is only for reading position data
        const clusterDataPositionData = new Float32Array(bucketData);
        const clusterBucketCountsData = new Float32Array(bucketDataCountData);

        _clusterDataGeometry = new Geometry();
        _clusterDataGeometry.addAttribute('position', new GeometryAttribute(new Float32Array(bucketDataCount * 3).fill(0), 3));
        _clusterDataGeometry.addAttribute('data', new GeometryAttribute(clusterDataPositionData, 4));
        _clusterDataGeometry.addAttribute('bucketCount', new GeometryAttribute(clusterBucketCountsData, 1));

        const options = {
            type: Device.system.os == 'ios' ? Texture.HALF_FLOAT : Texture.FLOAT,
            minFilter: Texture.NEAREST,
            magFilter: Texture.NEAREST,
            format: Texture.RGBAFormat,
            generateMipmaps: false
        };

        _clusterDebugBuffer = new RenderTarget(bucketDataSize, bucketDataSize, options);
        _clusterDataBuffer = new RenderTarget(bucketDataSize, bucketDataSize, options);

        const clusterDataDebugShader = _this.initClass(Shader, 'ClusterTest', {
            tPositions: { value: _meshData.position },
            uTextureSize: { value: _textureSize }
        });
        _clusterProgram = new Points(_clusterDataGeometry, clusterDataDebugShader);
    }

    //TODO: adapt relevant textures and upcoming shaders for clustering
    function initTextures() {
        const dataCount = _textureSize * _textureSize * 4;

        const options = {
            type: Device.system.os == 'ios' ? Texture.HALF_FLOAT : Texture.FLOAT,
            minFilter: Texture.NEAREST,
            magFilter: Texture.NEAREST,
            format: Texture.RGBAFormat,
            generateMipmaps: false
        };

        _predictedPosition = new DataTexture(new Float32Array(dataCount).fill(0), _textureSize, _textureSize);
        _prevPosition = new DataTexture(new Float32Array(dataCount).fill(0), _textureSize, _textureSize);

        _positionBuffer = new RenderTarget(_textureSize, _textureSize, options);
        _positionBuffer.multi = true;
        _positionBuffer.attachments = [_predictedPosition, _prevPosition];

        _velocityBuffer = new RenderTarget(_textureSize, _textureSize, options);
        _solvedPositionBuffer = new RenderTarget(_textureSize, _textureSize, options);
        _normalBuffer = new RenderTarget(_textureSize, _textureSize, options);
        _initPositionsBuffer = new RenderTarget(_textureSize, _textureSize, options);

        _copyBuffer = new RenderTarget(_textureSize, _textureSize, options);
        _interactionDataBuffer = new RenderTarget(_textureSize, _textureSize, options);


        if (!applyClustering) {
            initShapeMatchingBuffers();
        } else {
            initClusteredShapeMatchingBuffers();
        }
    }

    function initShapeMatchingBuffers() {
        const dataCount = _textureSize * _textureSize * 4;

        const options = {
            type: Device.system.os == 'ios' ? Texture.HALF_FLOAT : Texture.FLOAT,
            minFilter: Texture.NEAREST,
            magFilter: Texture.NEAREST,
            format: Texture.RGBAFormat,
            generateMipmaps: false
        };

        _initCenterOfMassBuffer = new RenderTarget(1, 1, options);
        _initRelativePositionBuffer = new RenderTarget(_textureSize, _textureSize, options);

        _currentCenterOfMassBuffer = new RenderTarget(1, 1, options);
        _relativePositionBuffer = new RenderTarget(_textureSize, _textureSize, options);

        _aqqBuffer0 = new DataTexture(new Float32Array(dataCount).fill(0), _textureSize, _textureSize);
        _aqqBuffer1 = new DataTexture(new Float32Array(dataCount).fill(0), _textureSize, _textureSize);
        _aqqBuffer2 = new DataTexture(new Float32Array(dataCount).fill(0), _textureSize, _textureSize);

        _aqqBuffer = new RenderTarget(_textureSize, _textureSize, options);
        _aqqBuffer.multi = true;
        _aqqBuffer.attachments = [_aqqBuffer0, _aqqBuffer1, _aqqBuffer2];

        _apqBuffer0 = new DataTexture(new Float32Array(dataCount).fill(0), _textureSize, _textureSize);
        _apqBuffer1 = new DataTexture(new Float32Array(dataCount).fill(0), _textureSize, _textureSize);
        _apqBuffer2 = new DataTexture(new Float32Array(dataCount).fill(0), _textureSize, _textureSize);

        _apqBuffer = new RenderTarget(_textureSize, _textureSize, options);
        _apqBuffer.multi = true;
        _apqBuffer.attachments = [_apqBuffer0, _apqBuffer1, _apqBuffer2];

        _apqColA = new RenderTarget(1, 1, options);
        _apqColB = new RenderTarget(1, 1, options);
        _apqColC = new RenderTarget(1, 1, options);

        _aqqColA = new RenderTarget(1, 1, options);
        _aqqColB = new RenderTarget(1, 1, options);
        _aqqColC = new RenderTarget(1, 1, options);

        _optimalRotationColA = new DataTexture(new Float32Array(4).fill(0), 1, 1);
        _optimalRotationColB = new DataTexture(new Float32Array(4).fill(0), 1, 1);
        _optimalRotationColC = new DataTexture(new Float32Array(4).fill(0), 1, 1);

        _optimalRotationBuffer = new RenderTarget(1, 1, options);
        _optimalRotationBuffer.multi = true;
        _optimalRotationBuffer.attachments = [_optimalRotationColA, _optimalRotationColB, _optimalRotationColC];
    }

    function initClusteredShapeMatchingBuffers() {
        const dataCount = _clusterDataSize * _clusterDataSize * 4;

        const options = {
            type: Device.system.os == 'ios' ? Texture.HALF_FLOAT : Texture.FLOAT,
            minFilter: Texture.NEAREST,
            magFilter: Texture.NEAREST,
            format: Texture.RGBAFormat,
            generateMipmaps: false
        };

        _initCenterOfMassBuffer = new RenderTarget(_clusterTileCount, _clusterTileCount, options);
        _initRelativePositionBuffer = new RenderTarget(_clusterDataSize, _clusterDataSize, options);

        _currentCenterOfMassBuffer = new RenderTarget(_clusterTileCount, _clusterTileCount, options);
        _relativePositionBuffer = new RenderTarget(_clusterDataSize, _clusterDataSize, options);

        _aqqBuffer0 = new DataTexture(new Float32Array(dataCount).fill(0), _clusterDataSize, _clusterDataSize);
        _aqqBuffer1 = new DataTexture(new Float32Array(dataCount).fill(0), _clusterDataSize, _clusterDataSize);
        _aqqBuffer2 = new DataTexture(new Float32Array(dataCount).fill(0), _clusterDataSize, _clusterDataSize);

        _aqqBuffer = new RenderTarget(_clusterDataSize, _clusterDataSize, options);
        _aqqBuffer.multi = true;
        _aqqBuffer.attachments = [_aqqBuffer0, _aqqBuffer1, _aqqBuffer2];

        _apqBuffer0 = new DataTexture(new Float32Array(dataCount).fill(0), _clusterDataSize, _clusterDataSize);
        _apqBuffer1 = new DataTexture(new Float32Array(dataCount).fill(0), _clusterDataSize, _clusterDataSize);
        _apqBuffer2 = new DataTexture(new Float32Array(dataCount).fill(0), _clusterDataSize, _clusterDataSize);

        _apqBuffer = new RenderTarget(_clusterDataSize, _clusterDataSize, options);
        _apqBuffer.multi = true;
        _apqBuffer.attachments = [_apqBuffer0, _apqBuffer1, _apqBuffer2];

        _apqColA = new RenderTarget(_clusterTileCount, _clusterTileCount, options);
        _apqColB = new RenderTarget(_clusterTileCount, _clusterTileCount, options);
        _apqColC = new RenderTarget(_clusterTileCount, _clusterTileCount, options);

        _aqqColA = new RenderTarget(_clusterTileCount, _clusterTileCount, options);
        _aqqColB = new RenderTarget(_clusterTileCount, _clusterTileCount, options);
        _aqqColC = new RenderTarget(_clusterTileCount, _clusterTileCount, options);

        const optimalRotationColDataCount = _clusterTileCount * _clusterTileCount * 4;
        _optimalRotationColA = new DataTexture(new Float32Array(optimalRotationColDataCount).fill(0), _clusterTileCount, _clusterTileCount);
        _optimalRotationColB = new DataTexture(new Float32Array(optimalRotationColDataCount).fill(0), _clusterTileCount, _clusterTileCount);
        _optimalRotationColC = new DataTexture(new Float32Array(optimalRotationColDataCount).fill(0), _clusterTileCount, _clusterTileCount);

        _optimalRotationBuffer = new RenderTarget(_clusterTileCount, _clusterTileCount, options);
        _optimalRotationBuffer.multi = true;
        _optimalRotationBuffer.attachments = [_optimalRotationColA, _optimalRotationColB, _optimalRotationColC];

        const clusterDataShader = _this.initClass(Shader, 'UpdateClusterData', {
            tMap: { value: null },
            uTextureSize: { value: _textureSize }
        });
        _clusterProgram = new Points(_clusterDataGeometry, clusterDataShader);
    }

    function initPrograms() {
        const geo = new Geometry();
        geo.addAttribute('position', _refGeometry.attributes.position);

        const quad = World.QUAD;

        let summationShader;
        if (!applyClustering) {
            summationShader = _this.initClass(Shader, 'Sum', {
                tMap: { value: null },
                uTextureSize: { value: _textureSize },
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: Shader.ADDITIVE_COLOR_ALPHA
            });
            _summationProgram = new Points(geo, summationShader);
        } else {
            summationShader = _this.initClass(Shader, 'SumBuckets', {
                tMap: { value: null },
                uTileCount: { value: _clusterTileCount },
                uTextureSize: { value: _textureSize },
                transparent: true,
                depthTest: false,
                depthWrite: false,
                blending: Shader.ADDITIVE_COLOR_ALPHA
            });
            _summationProgram = new Points(_clusterDataGeometry, summationShader);
        }
        // const clearDataShader = _this.initClass(Shader, 'clear');
        // _clearDataProgram = new Mesh(quad, clearDataShader);

        const copyDataShader = _this.initClass(Shader, 'CopyData', {
            tMap: { value: null }
        });

        _copyDataProgram = new Mesh(quad, copyDataShader);

        const initPositionsShader = _this.initClass(Shader, 'BlitInitPositions', {
            tMap: { value: null }
        });

        _initPositionsProgram = new Mesh(quad, initPositionsShader);

        const predictPositionShader = _this.initClass(Shader, 'PredictPosition', {
            tCurrentPosition: { value: null },
            tInitPosition: { value: null },
            tInteractionData: { value: null },
            tVelocity: { value: null },
            uAlpha: { value: 0.5 },
            uDeltaTime: { value: dt },
            uApplyInput: { value: 0 },
            uHitData: { value: new Vector3() },
            uRayOrigin: { value: new Vector3() },
            uRayDirection: { value: new Vector3() },
            uTextureSize: { value: _textureSize },
            uVertexCount: { value: _vertexCount },
            uBoundsMin: { value: new Vector3().copy(_refGeometry.boundingBox.min) },
            uBoundsMax: { value: new Vector3().copy(_refGeometry.boundingBox.max) }
        });

        _predictPositionProgram = new Points(geo, predictPositionShader);

        const relativePositionShaderID = !applyClustering ? 'RelativePosition' : 'RelativePositionClustered';

        const relativePositionUniforms = {
            tPosition: { value: null },
            tCenterOfMass: { value: null },
            uVertexCount: { value: _vertexCount },
            uTextureSize: { value: _textureSize }
        };

        const relativePositionClusteredUniforms = {
            tPosition: { value: null },
            tCenterOfMass: { value: null },
            uTileCount: { value: _clusterTileCount },
            uTextureSize: { value: _textureSize }
        };

        const relativePosUniforms = !applyClustering ? relativePositionUniforms : relativePositionClusteredUniforms;
        const relativePositionShader = _this.initClass(Shader, relativePositionShaderID, relativePosUniforms);

        let g = !applyClustering ? geo : _clusterDataGeometry;
        _relativePositionProgram = new Points(g, relativePositionShader);

        const calculateMatrixShaderID = !applyClustering ? 'CalculateMatrix' : 'CalculateMatrixClustered';
        const calculateMatrixUniforms = {
            tP: { value: null },
            tQ: { value: null },
            isQQ: { value: 0.0 },
            uTextureSize: { value: _textureSize }
        };
        const calculateMatrixClusteredUniforms = {
            tP: { value: null },
            tQ: { value: null },
            isQQ: { value: 0.0 }
        };

        let calcMatrixUniforms = !applyClustering ? calculateMatrixUniforms : calculateMatrixClusteredUniforms;
        const matrixCalculationShader = _this.initClass(Shader, calculateMatrixShaderID, calcMatrixUniforms);
        g = !applyClustering ? geo : _clusterDataGeometry;
        _matrixSetupProgram = new Points(g, matrixCalculationShader);

        const constructMatrixShaderID = !applyClustering ? 'ConstructMatrix' : 'ConstructMatrixClustered';
        const constructMatrixUniforms = {
            tAPQColA: { value: null },
            tAPQColB: { value: null },
            tAPQColC: { value: null },
            tAQQColA: { value: null },
            tAQQColB: { value: null },
            tAQQColC: { value: null },
            uBeta: { value: 0.5 },
            uTextureSize: { value: _textureSize }
        };

        const constructMatrixClusteredUniforms = {
            tAPQColA: { value: null },
            tAPQColB: { value: null },
            tAPQColC: { value: null },
            tAQQColA: { value: null },
            tAQQColB: { value: null },
            tAQQColC: { value: null },
            uBeta: { value: 0.5 },
            uTileCount: { value: _clusterTileCount }
        };
        const constructMatUniforms = !applyClustering ? constructMatrixUniforms : constructMatrixClusteredUniforms;
        const matrixConstructionShader = _this.initClass(Shader, constructMatrixShaderID, constructMatUniforms);

        const constructMatrixGeo = new Geometry();
        const totalTileCount = _clusterTileCount * _clusterTileCount;
        const tileIndexData = new Float32Array(totalTileCount * 4);

        constructMatrixGeo.addAttribute('position', new GeometryAttribute(new Float32Array(totalTileCount * 3).fill(0), 3));

        let dataIterator = 0;
        for (let i = 0; i < totalTileCount; i++) {
            const x = ((i % _clusterTileCount) + 0.5) / _clusterTileCount;
            const y = (Math.floor(i / _clusterTileCount) + 0.5) / _clusterTileCount;
            tileIndexData[dataIterator++] = x;
            tileIndexData[dataIterator++] = y;
            tileIndexData[dataIterator++] = i;
            tileIndexData[dataIterator++] = i;
        }

        constructMatrixGeo.addAttribute('data', new GeometryAttribute(tileIndexData, 4));
        _matrixConstructionProgram = !applyClustering ? new Mesh(quad, matrixConstructionShader) : new Points(constructMatrixGeo, matrixConstructionShader);
        // _matrixConstructionProgram = new Mesh(quad, matrixConstructionShader);

        const solvePositionShader = _this.initClass(Shader, 'ConstrainCollide', {
            tPredictedPosition: { value: null },
            tInitPositions: { value: null },
            tInitRelativePosition: { value: null },
            tCurrentCenterOfMass: { value: null },
            tInteractionData: { value: null },
            uAlpha: { value: 0.5 },
            uApplyInput: { value: 0 },
            uDeltaTime: { value: dt },
            uRayOrigin: { value: new Vector3() },
            uRayDirection: { value: new Vector3() },
            uHitData: { value: new Vector3(-1, -1, -1) },
            uTextureSize: { value: _textureSize },
            uVertexCount: { value: _vertexCount },
            uBoundsMin: { value: new Vector3().copy(_refGeometry.boundingBox.min) },
            uBoundsMax: { value: new Vector3().copy(_refGeometry.boundingBox.max) }
        });

        _solvePositionProgram = new Points(geo, solvePositionShader);

        const applyGoalPositionShaderID = !applyClustering ? 'ApplyGoalPositions' : 'ApplyGoalPositionsClustered';
        const applyGoalPositionUniforms = {
            tSolvedPosition: { value: null },
            tInitRelativePosition: { value: null },
            tCurrentCenterOfMass: { value: null },
            tRotationMatrixColA: { value: null },
            tRotationMatrixColB: { value: null },
            tRotationMatrixColC: { value: null },
            uAlpha: { value: 0.0015 },
            uTextureSize: { value: _textureSize },
            uVertexCount: { value: _vertexCount }
        };

        const applyGoalPositionClusteredUniforms = {
            tSolvedPosition: { value: null },
            tSolvedPositionClusters: { value: null },
            tInitRelativePosition: { value: null },
            tCurrentCenterOfMass: { value: null },
            tRotationMatrixColA: { value: null },
            tRotationMatrixColB: { value: null },
            tRotationMatrixColC: { value: null },
            uAlpha: { value: 0.1 },
            uTextureSize: { value: _textureSize },
            uTileCount: { value: _clusterTileCount },
            uBucketCount: { value: _bucketCount },
            uTileSize: { value: _clusterSliceSize }
        };

        const applyGoalPosUniforms = !applyClustering ? applyGoalPositionUniforms : applyGoalPositionClusteredUniforms;
        const applyGoalPositionShader = _this.initClass(Shader, applyGoalPositionShaderID, applyGoalPosUniforms);

        ShaderUIL.add(applyGoalPositionShader).setLabel('apply goal positions');
        _applyGoalPositionProgram = new Points(geo, applyGoalPositionShader);

        const initPosConstraintShader = _this.initClass(Shader, 'InitConstraints', {
            tPosition: { value: null },
            tInitPositions: { value: null },
            uTextureSize: { value: _textureSize }
        });

        _initPosConstraintProgram = new Points(geo, initPosConstraintShader);

        const updateVelocityShader = _this.initClass(Shader, 'UpdateVelocity', {
            tSolvedPosition: { value: null },
            tPrevPosition: { value: null },
            uDeltaTime: { value: dt },
            uTextureSize: { value: _textureSize }
        });

        _velocityUpdateProgram = new Points(geo, updateVelocityShader);

        const updateNormalShader = _this.initClass(Shader, 'UpdateNormals', {
            tNormal: { value: _meshData.normal },
            tPosition: { value: _meshData.position },
            tRotationMatrixColA: { value: null },
            tRotationMatrixColB: { value: null },
            tRotationMatrixColC: { value: null },
            uTextureSize: { value: _textureSize }
        });

        const updateNormalClusteredShader = _this.initClass(Shader, 'UpdateNormalsClustered', {
            tNormal: { value: _meshData.normal },
            tPosition: { value: _meshData.position },
            tRotationMatrixColA: { value: null },
            tRotationMatrixColB: { value: null },
            tRotationMatrixColC: { value: null },
            uTextureSize: { value: _textureSize },
            uTileCount: { value: _clusterTileCount },
            uBucketCount: { value: _bucketCount },
            uTileSize: { value: _clusterSliceSize }
        });

        _normalUpdateProgram = new Points(geo, !applyClustering ? updateNormalShader : updateNormalClusteredShader);

        const interactionShader = _this.initClass(Shader, 'interaction', {
            tPositionData: { value: null },
            uHitData: { value: new Vector3(-1, -1, -1) },
            uRayOrigin: { value: new Vector3(0, 0, 0) },
            uRayDirection: { value: new Vector3(0, 0, 0) },
            uTextureSize: { value: _textureSize }
        });

        _interactionProgram = new Points(geo, interactionShader);

        FBOHelper.instance().attach(_interactionDataBuffer, {
            width: _textureSize,
            name: 'intersections'
        });

        FBOHelper.instance().attach(_currentCenterOfMassBuffer, {
            width: 256,
            name: 'center of mass'
        });

        FBOHelper.instance().attach(_initRelativePositionBuffer, {
            width: 256,
            name: 'init pos'
        });

        FBOHelper.instance().attach(_apqColB, {
            width: 256,
            name: 'optmial rotations col b'
        });

        FBOHelper.instance().attach(_apqColC, {
            width: 256,
            name: 'optmial rotations col c'
        });
    }

    function predictPositions() {
        _predictPositionProgram.shader.set('tCurrentPosition', _solvedPositionBuffer.texture);
        _predictPositionProgram.shader.set('tCurrentCenterOfMass', _currentCenterOfMassBuffer.texture);
        _predictPositionProgram.shader.set('tInitRelativePosition', _initRelativePositionBuffer.texture);
        _predictPositionProgram.shader.set('tVelocity', _velocityBuffer.texture);

        _predictPositionProgram.shader.set('tRotationMatrixColA', _optimalRotationColA);
        _predictPositionProgram.shader.set('tRotationMatrixColB', _optimalRotationColB);
        _predictPositionProgram.shader.set('tRotationMatrixColC', _optimalRotationColC);

        World.RENDERER.renderSingle(_predictPositionProgram, World.CAMERA, _positionBuffer);
    }

    function sum({ initTexture, result }) {
        _summationProgram.shader.set('tMap', initTexture);
        World.RENDERER.renderSingle(_summationProgram, World.CAMERA, result);
    }

    function updateRelativePosition({ position, centerOfMass, target }) {
        _relativePositionProgram.shader.set('tPosition', position);
        _relativePositionProgram.shader.set('tCenterOfMass', centerOfMass);
        World.RENDERER.renderSingle(_relativePositionProgram, World.CAMERA, target);
    }

    function assembleMatrix({ P, Q, isQQ, target }) {
        _matrixSetupProgram.shader.set('tP', P);
        _matrixSetupProgram.shader.set('tQ', Q);
        _matrixSetupProgram.shader.set('isQQ', isQQ ? 1.0 : 0.0);
        World.RENDERER.renderSingle(_matrixSetupProgram, World.CAMERA, target);
    }

    function constructRotationMatrix() {
        _matrixConstructionProgram.shader.set('tAPQColA', _apqColA.texture);
        _matrixConstructionProgram.shader.set('tAPQColB', _apqColB.texture);
        _matrixConstructionProgram.shader.set('tAPQColC', _apqColC.texture);
        _matrixConstructionProgram.shader.set('tAQQColA', _aqqColA.texture);
        _matrixConstructionProgram.shader.set('tAQQColB', _aqqColB.texture);
        _matrixConstructionProgram.shader.set('tAQQColC', _aqqColC.texture);
        World.RENDERER.renderSingle(_matrixConstructionProgram, World.CAMERA, _optimalRotationBuffer);
    }

    function solvePositions() {
        _copyDataProgram.shader.set('tMap', _solvedPositionBuffer.texture);
        World.RENDERER.renderSingle(_copyDataProgram, World.CAMERA, _copyBuffer);

        _solvePositionProgram.shader.set('tPredictedPosition', _copyBuffer.texture);
        _solvePositionProgram.shader.set('tInitPositions', _meshData.position);
        _solvePositionProgram.shader.set('tInitRelativePosition', _initRelativePositionBuffer.texture);
        _solvePositionProgram.shader.set('tCurrentCenterOfMass', _currentCenterOfMassBuffer.texture);

        _solvePositionProgram.shader.set('uAlpha', 1.5);

        World.RENDERER.renderSingle(_solvePositionProgram, World.CAMERA, _solvedPositionBuffer);
    }

    function applyGoalPositions() {
        _copyDataProgram.shader.set('tMap', _predictedPosition);
        World.RENDERER.renderSingle(_copyDataProgram, World.CAMERA, _copyBuffer);

        _applyGoalPositionProgram.shader.set('tSolvedPosition', _copyBuffer.texture);
        _applyGoalPositionProgram.shader.set('tInitRelativePosition', _initRelativePositionBuffer.texture);
        _applyGoalPositionProgram.shader.set('tCurrentCenterOfMass', _currentCenterOfMassBuffer.texture);

        _applyGoalPositionProgram.shader.set('tRotationMatrixColA', _optimalRotationColA);
        _applyGoalPositionProgram.shader.set('tRotationMatrixColB', _optimalRotationColB);
        _applyGoalPositionProgram.shader.set('tRotationMatrixColC', _optimalRotationColC);

        World.RENDERER.renderSingle(_applyGoalPositionProgram, World.CAMERA, _solvedPositionBuffer);
    }

    function applyInitPosConstraints() {
        // return;
        _copyDataProgram.shader.set('tMap', _solvedPositionBuffer.texture);
        World.RENDERER.renderSingle(_copyDataProgram, World.CAMERA, _copyBuffer);
        _initPosConstraintProgram.shader.set('tPosition', _copyBuffer.texture);
        World.RENDERER.renderSingle(_initPosConstraintProgram, World.CAMERA, _solvedPositionBuffer);
    }

    function updateVelocity() {
        _velocityUpdateProgram.shader.set('tSolvedPosition', _solvedPositionBuffer.texture);
        _velocityUpdateProgram.shader.set('tPrevPosition', _prevPosition);

        World.RENDERER.renderSingle(_velocityUpdateProgram, World.CAMERA, _velocityBuffer);
    }

    function updateNormal() {
        if (applyClustering) {
            _clusterProgram.shader.set('tMap', _meshData.normal);
            World.RENDERER.renderSingle(_clusterProgram, World.CAMERA, _clusterDataBuffer);
            _normalUpdateProgram.shader.set('tNormal', _clusterDataBuffer.texture);
        } else {
            _normalUpdateProgram.shader.set('tNormal', _meshData.normal);
        }

        _normalUpdateProgram.shader.set('tRotationMatrixColA', _optimalRotationColA);
        _normalUpdateProgram.shader.set('tRotationMatrixColB', _optimalRotationColB);
        _normalUpdateProgram.shader.set('tRotationMatrixColC', _optimalRotationColC);
        World.RENDERER.renderSingle(_normalUpdateProgram, World.CAMERA, _normalBuffer);
    }

    function preWarm() {
        _meshData.blit();

        _predictPositionProgram.shader.set('tInitPosition', _meshData.position);

        if (applyClustering) {
            _clusterProgram.shader.set('tMap', _meshData.position);
            World.RENDERER.renderSingle(_clusterProgram, World.CAMERA, _clusterDataBuffer);
        }

        //compute initial center of mass
        sum({ initTexture: !applyClustering ? _meshData.position : _clusterDataBuffer.texture, result: _initCenterOfMassBuffer });

        // compute init relativePositions (which is also used for computing the AQQ matrix)
        updateRelativePosition({ position: !applyClustering ? _meshData.position : _clusterDataBuffer.texture, centerOfMass: _initCenterOfMassBuffer.texture, target: _initRelativePositionBuffer });

        assembleMatrix({ P: _initRelativePositionBuffer.texture,
            Q: _initRelativePositionBuffer.texture,
            isQQ: true,
            target: _aqqBuffer });

        //sum all directions according to paper
        sum({ initTexture: _aqqBuffer0, result: _aqqColA });
        sum({ initTexture: _aqqBuffer1, result: _aqqColB });
        sum({ initTexture: _aqqBuffer2, result: _aqqColC });

        //this will determine the rotation matrix needed for the goal positions
        constructRotationMatrix();

        _copyDataProgram.shader.set('tMap', _meshData.position);
        World.RENDERER.renderSingle(_copyDataProgram, World.CAMERA, _solvedPositionBuffer);

        _initPositionsProgram.shader.set('tMap', _meshData.position);
        World.RENDERER.renderSingle(_initPositionsProgram, World.CAMERA, _initPositionsBuffer);
        _initPosConstraintProgram.shader.set('tInitPositions', _initPositionsBuffer.texture);
        _predictPositionProgram.shader.set('tInitPosition', _initPositionsBuffer.texture);
        _solvePositionProgram.shader.set('tInitPositions', _initPositionsBuffer.texture);

        _copyDataProgram.shader.set('tMap', _meshData.normal);
        World.RENDERER.renderSingle(_copyDataProgram, World.CAMERA, _normalBuffer);
    }

    function loop() {
        if (_this.flag('firstTick')) {
            _this.flag('firstTick', false);
            preWarm();
            return;
        }

        // World.RENDERER.renderSingle(_clusterProgram, World.CAMERA, _clusterDebugBuffer);

        predictPositions();

        if (applyClustering) {
            _clusterProgram.shader.set('tMap', _predictedPosition);
            World.RENDERER.renderSingle(_clusterProgram, World.CAMERA, _clusterDataBuffer);
        }

        //get current center of mass
        sum({ initTexture: !applyClustering ? _predictedPosition : _clusterDataBuffer.texture, result: _currentCenterOfMassBuffer });

        updateRelativePosition({ position: !applyClustering ? _predictedPosition : _clusterDataBuffer.texture, centerOfMass: _currentCenterOfMassBuffer.texture, target: _relativePositionBuffer });

        assembleMatrix({ P: _relativePositionBuffer.texture, Q: _initRelativePositionBuffer.texture, isQQ: false, target: _apqBuffer });
        //sum all directions according to paper
        sum({ initTexture: _apqBuffer0, result: _apqColA });
        sum({ initTexture: _apqBuffer1, result: _apqColB });
        sum({ initTexture: _apqBuffer2, result: _apqColC });

        //this will determine the rotation matrix needed for the goal positions
        constructRotationMatrix();
        applyGoalPositions();

        for (let i = 0; i < SUB_STEP_COUNT; i++) {
            solvePositions();
            // applyInitPosConstraints();
        }


        updateVelocity();
        updateNormal();

        _outputMesh.mesh.shader.set('tPosition', _solvedPositionBuffer.texture);
        _outputMesh.mesh.shader.set('tNormal', _normalBuffer.texture);
    }

    //*** Event handlers
    function addHandlers() {
        _projector = _this.initClass(ScreenProjection, World.CAMERA);
        _gpuIntersect = _this.initClass(GPURayCast, { geometry: _refGeometry });

        _this.events.sub(Mouse.input, Interaction.START, handleMouseDown);
        _this.events.sub(Mouse.input, Interaction.MOVE, handleMouseMove);
        _this.events.sub(Mouse.input, Interaction.END, handleMouseUp);
    }

    function handleMouseDown(e) {
        let p = _projector.unproject(Mouse, Stage);
        p = new Vector2(Mouse.normal.x * 2.0 - 1.0, (1.0 - Mouse.normal.y) * 2.0 - 1.0);

        _rayCaster.setFromCamera(p, World.CAMERA);
        const { origin, direction } = _rayCaster.ray;
        _gpuIntersect.getIntersection({ rayOrigin: origin, rayDirection: direction, positionData: _solvedPositionBuffer.texture });

        _interactionProgram.shader.set('tPositionData', _solvedPositionBuffer.texture);
        _interactionProgram.shader.set('uRayOrigin', origin);
        _interactionProgram.shader.set('uRayDirection', direction);
        _interactionProgram.shader.set('uHitData', _gpuIntersect.result);

        World.RENDERER.renderSingle(_interactionProgram, World.CAMERA, _interactionDataBuffer);

        _solvePositionProgram.shader.set('uApplyInput', 1);
        _solvePositionProgram.shader.set('uHitData', _gpuIntersect.result);
        _solvePositionProgram.shader.set('tInteractionData', _interactionDataBuffer.texture);
        _solvePositionProgram.shader.set('uRayDirection', direction);
        _solvePositionProgram.shader.set('uRayOrigin', origin);
    }

    function handleMouseMove(e) {
        let p = _projector.unproject(Mouse, Stage);
        p = new Vector2(Mouse.normal.x * 2.0 - 1.0, (1.0 - Mouse.normal.y) * 2.0 - 1.0);
        _rayCaster.setFromCamera(p, World.CAMERA);
        const { origin, direction } = _rayCaster.ray;
        _solvePositionProgram.shader.set('uRayDirection', direction);
        _solvePositionProgram.shader.set('uRayOrigin', origin);
    }

    function handleMouseUp(e) {
        _solvePositionProgram.shader.set('uApplyInput', 0);
    }

    //*** Public methods
}, _ => {
    Elastic.INTERACTING = 'elasticinteracting';
});
