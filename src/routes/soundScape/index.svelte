<script>

    import {onMount, tick} from 'svelte';
    import {ACCESSTOKENKEY} from "$lib/_globals";
    import {soundScape} from '$lib/sketches/soundScape/soundScape.js';
    import SpotifyAuthentication from "$lib/utils/SpotifyAuthentication.svelte";
    import SpotifyPlayer from "$lib/utils/SpotifyPlayer.svelte";

    import TimbreWorker from '$lib/workers/soundScape/timbreWorker.js?worker';

    //--------------------------------

    let el;
    let canvas;
    let sketch;

    let containerWidth = 2;
    let containerHeight = 2;

    let time = 0;
    let deltaTime = 0;
    let prevTime = 0;

    let spotifyPlayer;
    let player;
    let accessToken = null;
    let timbreWorker;
    let currentAudioFeatures;
    let currentTimbreData;
    let playbackPosition = 0;
    let trackDuration = 1;
    let currentAudioAnalysisData;
    let currentLoudnessData;

    let timbreDataBars = [];

    let audioBar;

    //--------------------------------

    onMount(async () => {

        timbreDataBars = new Array(12);

        inittimbreWorker();

        accessToken = localStorage.getItem(ACCESSTOKENKEY);

        await tick();

        // sketch = new soundScape({el: canvas});

        handleTick();

    });

    const inittimbreWorker = () => {

        timbreWorker = new TimbreWorker();
        timbreWorker.onmessage = (event) => {
            currentTimbreData = event.data.timbreData;
            currentLoudnessData = event.data.loudnessData;
        };

    }

    const handleAccessTokenRecieved = (event) => {

        const {token} = event.detail;
        accessToken = token;
        localStorage.setItem(ACCESSTOKENKEY, accessToken);

    }

    const handleAvaiableAudioAnalysisComplete = (event) => {

        const {audioFeatures, audioAnalysisData} = event.detail;
        currentAudioAnalysisData = audioAnalysisData;

        trackDuration = audioAnalysisData.track.duration;
        currentAudioFeatures = audioFeatures;
        timbreWorker.postMessage(audioAnalysisData);

    }

    const updateClock = () => {

        time = performance.now();
        deltaTime = (time - prevTime) * 0.001;
        prevTime = time;

    }


    //TODO: RESET PITCH OR TIMBRE VECTORS TO 0 WHEN TRACK IS DONE (OR MAKE THE VLAUES REDUCE TO 0 OVER TIME)
    //TODO: COMPARE PITCH AND TIMBRE OUTPUTS AGAIN. OR SEE HOW BOTH INFOMRATIONS CAN BE COMBINED?
    const handleTick = () => {
        window.requestAnimationFrame(() => handleTick());

        if (!spotifyPlayer) return;

        spotifyPlayer.getCurrentPlayerState();

        // let playbackTime = playbackPosition / 1000.0;
        let trackPhase = (playbackPosition / 1000.0) / trackDuration;
        console.log(trackPhase)
        if (currentTimbreData) {
            let segmentIndex = Math.floor(trackPhase * (currentTimbreData.length - 1))
            console.log("SEGMENT INDEX: ", segmentIndex)
            timbreDataBars.forEach((bar, i) => {
                // bar.style.height = Math.abs(currentTimbreData[segmentIndex][i]) * 2 + 'px';
                // bar.style.width = Math.sqrt(currentTimbreData[segmentIndex][i]*currentTimbreData[segmentIndex][i]) + 'px';
                bar.style.width = currentTimbreData[segmentIndex][i] * currentTimbreData[segmentIndex][i] * 100.0 + 'px';
            })
        }


        updateClock();

        // player.getCurrentState().then((state) => {
        //     if(!state) {
        //         console.log('no music is being played');
        //     }
        //
        // })

        // sketch.update({time, deltaTime});

    }

    const handleResize = () => {
        sketch.onresize({width: containerWidth, height: containerHeight})
    }

</script>

<svelte:head>
</svelte:head>

<svelte:window on:resize={handleResize}/>

<main class=sketch bind:this={el} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
    <!--        <canvas class=webgl-canvas bind:this={canvas}></canvas>-->
    <div class="audio-test">
        {#each timbreDataBars as dataBar, i}
            <div class="audio-test__bar" bind:this={timbreDataBars[i]}></div>
        {/each}
    </div>
    {#if accessToken === null}
        <SpotifyAuthentication on:accessTokenRecieved={handleAccessTokenRecieved}/>
    {:else}
        <SpotifyPlayer bind:this={spotifyPlayer} bind:playbackPosition={playbackPosition}
                       on:audioAnalysisComplete={handleAvaiableAudioAnalysisComplete}/>
    {/if}
</main>

<style lang=scss>

  .sketch {
    position: absolute;
    min-width: 100vw;
    min-height: 100vh;
    overflow: hidden;
    background-color: black;
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

  .audio-test {

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    width: 35vw;
    height: 50vh;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;

    &__bar {
      background-color: #ffffff;
      width: 1px;
      transition: width 0.2s;
      height: 1px
    }

  }

</style>
