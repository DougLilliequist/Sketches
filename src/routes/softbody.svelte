<script>
    
    import { onMount, tick } from 'svelte';
    import {softbody} from '$lib/sketches/softbody/softbody.js';
    
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

        sketch = new softbody({el: canvas});

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
    
<main class=sketch bind:this={el} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    <canvas class=webgl-canvas bind:this={canvas}></canvas>
</main>
    
<style lang=scss>
    
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
    
</style>
