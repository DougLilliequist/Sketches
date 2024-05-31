import ClothSimulator from "./clothSimulator";
import {Plane, Program, Mesh, Texture, Vec2, Camera, Shadow, Mat4} from "ogl";

import vertex from './shaders/cloth.vs.glsl?raw';
import fragment from './shaders/cloth.fs.glsl?raw';
import vertexShader from "./shaders/clothShaderShadow.vs.glsl?raw";
import fragmentShadow from "./shaders/clothShaderShadow.fs.glsl?raw";

export default class ClothMesh extends Mesh {
    constructor(gl, {resolution = new Vec2(64, 64), camera} = {}) {
        super(gl);
        this.gl = gl;
        this.geometry = new Plane(this.gl, {width: 2, height: 2, widthSegments: resolution.x, heightSegments: resolution.y});
        this.data = new ClothSimulator(this.gl, {resolution, geometry: this.geometry, camera});

        // Create an empty texture using the gl.TEXTURE_CUBE_MAP target
        const texture = new Texture(gl, {
            target: gl.TEXTURE_CUBE_MAP,
        });


        const blueNoiseImg = new Image();
        blueNoiseImg.crossOrigin = "*";
        blueNoiseImg.src = 'src/lib/sketches/cloth/assets/bluenoise256.png';

        const blueNoise = new Texture(this.gl);
        // const blueNoise = this.loadTexture('./src/lib/sketches/kreatur/assets/bluenoise256.png');
        blueNoise.wrapS = this.gl.REPEAT;
        blueNoise.wrapT = this.gl.REPEAT;
        blueNoise.minFilter = this.gl.NEAREST;
        blueNoise.magFilter = this.gl.NEAREST;
        blueNoise.onload = () => blueNoise.image = blueNoiseImg;

        this.program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                tPosition: {value: new Texture(this.gl)},
                tNormal: {value: new Texture(this.gl)},
                tEnvMap: { value: texture},
                tBlueNoise: {value: blueNoise},
                uShadowTexelSize: {value: 1.0/2048},
                uTime: {value: 0}
            },
            cullFace: null,
            transparent: false,
            // depthTest: false,
            // depthWrite: false
        });

        this.loadImages(texture);
        this.initShadowPass();


    }

    async loadImages(_texture) {
        function loadImage(src) {
            return new Promise((res) => {
                const img = new Image();
                img.onload = () => res(img);
                img.src = src;
            });
        }

        const images = await Promise.all([
            loadImage('src/lib/sketches/cloth/assets/cubemapforest/posx.jpg'),
            loadImage('src/lib/sketches/cloth/assets/cubemapforest/negx.jpg'),
            loadImage('src/lib/sketches/cloth/assets/cubemapforest/posy.jpg'),
            loadImage('src/lib/sketches/cloth/assets/cubemapforest/negy.jpg'),
            loadImage('src/lib/sketches/cloth/assets/cubemapforest/posz.jpg'),
            loadImage('src/lib/sketches/cloth/assets/cubemapforest/negz.jpg'),
        ]);

        _texture.image = images;
    }

    initShadowPass() {

        this.shadowCamera = new Camera(this.gl, {
            near: 0.1,
            far: 20.0,
            left: -8,
            right: 8,
            top: 8,
            bottom: -8
        });

        this.shadowCamera.position.set(0.0, 10.0, 5.0);
        // this.shadowCamera.position.set(0.0, 10.0, 0.0);
        this.shadowCamera.lookAt([0.0, 0.0, 0.0]);

        this.shadowPass = new Shadow(this.gl, {light: this.shadowCamera, width: 2048, height: 2048});
        this.shadowPass.add({mesh: this, vertex: vertexShader, fragment: fragmentShadow});
        this.depthProgram.uniforms.tPosition = {value: this.data.position};
        this.depthProgram.uniforms.tNormal = {value: this.data.normals};

    }

    update({time = 0, deltaTime = 1, inputPos, interacting} = {}) {

        this.data.update({time, inputPos, interacting, deltaTime});
        this?.shadowPass?.render?.({scene: this});

        this.program.uniforms.tPosition.value = this.data.position;
        this.program.uniforms.tNormal.value = this.data.normals;
        this.program.uniforms.uTime.value += 0.001;

    }

}
