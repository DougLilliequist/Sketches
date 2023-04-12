Class(function MeshData(_refGeo, _size) {
    Inherit(this, Component);
    const _this = this;

    let _mesh, _meshDataBuffer, _positionData, _normalData;
    // let _size;

    //*** Constructor
    (async function () {
        _this.flag('isReady', false);

        const vertexCount = _refGeo.attributes.position.array.length / 3;
        // _size = Math.ceil(Math.sqrt(vertexCount));

        const options = {
            type: Device.system.os == 'ios' ? Texture.HALF_FLOAT : Texture.FLOAT,
            minFilter: Texture.NEAREST,
            magFilter: Texture.NEAREST,
            format: Texture.RGBAFormat,
            generateMipmaps: false
        };

        const arr = new Float32Array(_size * _size * 4).fill(0);
        _positionData = new DataTexture(arr, _size, _size);
        _normalData = new DataTexture(arr, _size, _size);

        _meshDataBuffer = new RenderTarget(_size, _size, options);
        _meshDataBuffer.multi = true;
        _meshDataBuffer.attachments = [_positionData, _normalData];

        const geo = new Geometry();
        geo.addAttribute('position', _refGeo.attributes.position);
        geo.addAttribute('normal', _refGeo.attributes.normal);

        const program = _this.initClass(Shader, 'meshData', {
            uVertexCount: { value: vertexCount },
            uTextureSize: { value: _size }
        });

        _mesh = new Points(geo, program);
        World.RENDERER.renderSingle(_mesh, World.CAMERA, _meshDataBuffer);
        _this.flag('isReady', true);
    })();

    function blit() {
        if (!_this.flag('isReady')) return;
        World.RENDERER.renderSingle(_mesh, World.CAMERA, _meshDataBuffer);
    }

    //*** Event handlers

    //*** Public methods
    _this.get('position', _ => _positionData);
    _this.get('normal', _ => _normalData);
    _this.blit = blit;
    _this.isReady = () => _this.wait('isReady');
});
