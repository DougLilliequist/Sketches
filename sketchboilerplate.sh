#!/bin/sh
cd ./src
cd ./lib
cd ./sketches
echo "Enter project name: "
read projectName
mkdir $projectName
cd ./$projectName
mkdir assets
touch params.js
touch $projectName.js
echo "import {Renderer, Camera, Transform, Orbit, Vec3, Vec2} from 'ogl';

export class $projectName {
    constructor({el}) {

        this.init({el});

    }

    init({el}) {

        this.renderer = new Renderer({
            canvas: el,
            width: el.clientWidth,
            height: el.clientHeight, 
            antialias: true,
            dpr: 1
        });

        this.gl = this.renderer.gl;
        const bg = 0.93;
        this.gl.clearColor(bg,bg,bg, 1.0);

        const {
            clientWidth,
            clientHeight
        } = this.gl.canvas;

        this.wk = 1.0 / clientWidth;
        this.hK = 1.0 / clientHeight;

        this.camera = new Camera(this.gl, {
            aspect: clientWidth / clientHeight
        });

        this.camera.position.x = 0.0;
        this.camera.position.y = 0.0;
        this.camera.position.z = 5.0;

        this.controls = new Orbit(this.camera, {
            target: new Vec3(0, 0.0, 0),
        });

        this.scene = new Transform();

    }

    render({
        scene,
        camera = null,
        target = null,
        clear
    }) {
        this.renderer.render({
            scene,
            camera,
            clear
        });
    }

    update({
        time,
        deltaTime
    }) {

        this.controls.update();

        this.render({
            scene: this.scene,
            camera: this.camera,
            clear: true
        });

    }

    onResize(width, height) {
        if (width && height) {
            this.renderer.setSize(width, height);
            const {
                clientWidth,
                clientHeight
            } = this.gl.canvas;

            this.wk = 1.0 / clientWidth;
            this.hK = 1.0 / clientHeight;

            this.camera.perspective({
                aspect: clientWidth / clientHeight
            });
        }
    }
}" >> $projectName.js
cd ../
cd ../
cd ../
cd ./routes
touch $projectName.svelte
echo "<script>
    
    import { onMount, tick } from 'svelte';
    import {$projectName} from '\$lib/sketches/$projectName/$projectName.js';
    
    //--------------------------------
            
    let el;
    let canvas;
    let sketch;

    let containerWidth = 2;
    let containerHeight = 2;

    let time = 0;
    let deltaTime = 0;
    let prevTime = 0;
    
    //--------------------------------
    
    onMount(async()=> {
        
        await tick();

        sketch = new $projectName({el: canvas});

        handleTick();
            
    });

    const updateClock = () => {

        time = performance.now();
        deltaTime = (time - prevTime) * 0.001;
        prevTime = time;

    }

    const handleTick = () => {
        window.requestAnimationFrame(() => handleTick());
        updateClock();
        sketch.update({time, deltaTime});

    }

    const handleResize = () => {
        sketch.onresize({width: containerWidth, height: containerHeight})
    }
    
</script>

<svelte:window on:resize={handleResize} />
    
<main class="sketch" bind:this={el} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    <canvas class="webgl-canvas" bind:this={canvas}></canvas>
</main>
    
<style lang="scss">
    
    .sketch {
            position: absolute;
            min-width: 100vw;
            min-height: 100vh;
            overflow: hidden;
    }

    .webgl-canvas {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            margin: 0;
            border: 0px;
    }
    
</style>" >> $projectName.svelte