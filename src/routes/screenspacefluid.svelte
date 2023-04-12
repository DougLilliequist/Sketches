<script>

    import { onMount, tick } from 'svelte';
    import {screenspacefluid} from '$lib/sketches/screenspacefluid/screenspacefluid.js';

    //--------------------------------

    let el;
    let canvas;
    let sketch;

    let containerWidth = 2;
    let containerHeight = 2;

    let time = 0;
    let deltaTime = 0;
    let prevTime = 0;

    let canvasWidth = 2;
    let canvasHeight = 2;

    let firstMove = true;

    const userInput = {
        posX: 0,
        posY: 0,
        prevPosX: 0,
        prevPosY: 0,
        deltaX: 0,
        deltaY: 0
    }

    //--------------------------------

    onMount(async()=> {

        await tick();

        sketch = new screenspacefluid({el: canvas});

        handleTick();

    });

    const updateClock = () => {

        time = performance.now();
        deltaTime = (time - prevTime) * 0.001;
        prevTime = time;

    }

    const handleMouseMove = (event) => {

        const x = event.pageX;
        const y = event.pageY;

        if (firstMove) {
            firstMove = false;
            userInput.prevPosX = x;
            userInput.prevPosY = y;
        }

        userInput.posX = x;
        userInput.posY = y;

        userInput.deltaX = (userInput.posX - userInput.prevPosX) * 5;
        userInput.deltaY = (userInput.posY - userInput.prevPosY) * -5;

        userInput.prevPosX = userInput.posX;
        userInput.prevPosY = userInput.posY;

        if (Math.abs(userInput.deltaX) || Math.abs(userInput.deltaY)) {

            sketch.fluidSim.splats.push({
                posX: userInput.posX / window.innerWidth,
                posY: 1.0 - (userInput.posY / window.innerHeight),
                deltaX: userInput.deltaX,
                deltaY: userInput.deltaY
            });

        }
    }

    const handleTick = () => {
        window.requestAnimationFrame(() => handleTick());
        updateClock();
        sketch.update({time, deltaTime, userInput});

    }

    const handleResize = () => {
        sketch.onresize({width: containerWidth, height: containerHeight})
    }

</script>

<svelte:window on:resize={handleResize} />

<main class=sketch bind:this={el} on:mousemove={handleMouseMove} bind:clientWidth={canvasWidth} bind:clientHeight={canvasHeight}>
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
