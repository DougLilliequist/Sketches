Class(function GPURayCast({ geometry = null } = {}) {
    Inherit(this, Component);
    const _this = this;

    let _intersectBuffer = null;
    let _program, _data;

    //*** Constructor
    (function () {
        initBuffers();
        initProgram(geometry);
    })();

    function initBuffers() {
        const options = {
            type: Device.system.os == 'ios' ? Texture.HALF_FLOAT : Texture.FLOAT,
            minFilter: Texture.NEAREST,
            magFilter: Texture.NEAREST,
            format: Texture.RGBAFormat,
            generateMipmaps: false
        };

        _intersectBuffer = new RenderTarget(1, 1, options);
        setFBOBufferType(_intersectBuffer);

        FBOHelper.instance().attach(_intersectBuffer, {
            width: 600,
            name: 'intersect data'
        });
    }

    function setFBOBufferType(fbo) {
        const possibleTypes = {};

        possibleTypes[Texture.UNSIGNED_BYTE] = Uint8Array;
        possibleTypes[Texture.FLOAT] = possibleTypes[Texture.HALF_FLOAT] = Float32Array;

        const type = possibleTypes[fbo.texture ? fbo.texture.type : fbo.type];
        if (!type) {
            console.warn(`Can't find texture type ${fbo.texture.type}`);
        }

        fbo.__pixelBuffer = new type(4);
    }

    function initProgram(_geometry, _meshData) {
        const indexData = _geometry.index;
        const triangleCount = indexData.length / 3;
        let positionData = new Float32Array(triangleCount * 3);

        let iterator = 0.0;

        for (let i = 0; i < triangleCount; i++) {
            positionData[iterator++] = indexData[i * 3];
            positionData[iterator++] = indexData[i * 3 + 1];
            positionData[iterator++] = indexData[i * 3 + 2];
        }

        console.log(positionData);

        const geo = new Geometry();
        geo.addAttribute('position', new GeometryAttribute(positionData, 3));

        const intersectionShader = _this.initClass(Shader, 'GpuRaycast', {
            tPositionData: { value: null },
            uTextureSize: { value: 128 },
            uCameraFarNear: { value: new Vector2(World.CAMERA.far, World.CAMERA.near) },
            uRayOrigin: { value: new Vector3() },
            uRayDirection: { value: new Vector3() }
        });

        _program = new Points(geo, intersectionShader);
    }

    //*** Event handlers
    function addHandlers() {
        //add mouse down, mouse move and mouse up events
    }

    function getIntersection({ rayOrigin, rayDirection, positionData }) {
        _program.shader.set('tPositionData', positionData);
        _program.shader.set('uRayOrigin', rayOrigin);
        _program.shader.set('uRayDirection', rayDirection);

        World.RENDERER.renderSingle(_program, World.CAMERA, _intersectBuffer);

        _data = World.RENDERER.readPixels(_intersectBuffer, 0, 0, 1, 1, _intersectBuffer.__pixelBuffer, World.RENDERER.context.FLOAT);
    }

    //*** Public methods
    this.getIntersection = getIntersection;
    // this.get('result', _ => _intersectBuffer.texture);
    this.get('result', _ => new Vector3(_data[0], _data[1], _data[2]));
});
