Class(function OutputMesh(_geometry, _size) {
    Inherit(this, Object3D);
    const _this = this;

    let _mesh;

    //*** Constructor
    (function () {
        const vertexCount = _geometry.attributes.position.array.length / 3;
        // const size = Math.ceil(Math.sqrt(vertexCount));
        console.log(_geometry);
        // console.log(_geometry);

        const program = _this.initClass(Shader, 'OutputMeshPBR', {
            tPosition: { value: null, ignoreUIL: true },
            tNormal: { value: null, ignoreUIL: true },
            uVertexCount: { value: vertexCount, ignoreUIL: true },
            uTextureSize: { value: _size, ignoreUIL: true },
            uInputPos: { value: new Vector3(0.0, 0.0, 0.0), ignoreUIL: true },
            uHitPoint: { value: new Vector3(0.0, 0.0, 0.0), ignoreUIL: true },
            uApplyInput: { value: 0, ignoreUIL: true },
            uBoundsMin: { value: new Vector3().copy(_geometry.boundingBox.min), ignoreUIL: true },
            uBoundsMax: { value: new Vector3().copy(_geometry.boundingBox.max), ignoreUIL: true },
            uLightColor: { value: new Vector3() }
        });

        ShaderUIL.add(program).setLabel('output mesh shader');

        _mesh = new Mesh(_geometry, program);
        _this.add(_mesh);
    })();

    //*** Event handlers

    //*** Public methods
    _this.get('mesh', _ => _mesh);
});
