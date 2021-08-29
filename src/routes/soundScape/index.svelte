<script>

    import {onMount, tick} from 'svelte';
    import {ACCESSTOKENKEY} from "$lib/_globals";
    import {soundScape} from '$lib/sketches/soundScape/soundScape.js';
    import SpotifyAuthentication from "$lib/utils/SpotifyAuthentication.svelte";
    import SpotifyPlayer from "$lib/utils/SpotifyPlayer.svelte";

    import Timbre1DWorker from '$lib/workers/soundScape/timbre1dWorker.js?worker';

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
    let timbre1dworker;
    let currentAudioFeatures;
    let currentTimbreData;
    let playbackPosition = 0;
    let trackDuration = 1;
    let currentAudioAnalysisData;
    let currentLoudnessData;

    let audioBar;

    //--------------------------------

    onMount(async () => {

        initTimbre1DWorker();

        accessToken = localStorage.getItem(ACCESSTOKENKEY);

        await tick();

        // sketch = new soundScape({el: canvas});

        handleTick();

    });

    const initTimbre1DWorker = () => {

        timbre1dworker = new Timbre1DWorker();
        timbre1dworker.onmessage = (event) => {
            console.log(event.data)
            currentTimbreData = event.data.timbre1DData;
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
        timbre1dworker.postMessage(audioAnalysisData);

    }

    const updateClock = () => {

        time = performance.now();
        deltaTime = (time - prevTime) * 0.001;
        prevTime = time;

    }

    const handleTick = () => {
        window.requestAnimationFrame(() => handleTick());

        if(spotifyPlayer){
            spotifyPlayer.getCurrentPlayerState();

            // let playbackTime = playbackPosition / 1000.0;
            let trackPhase = (playbackPosition / 1000.0) / trackDuration;
            if(currentTimbreData) {
                let segmentIndex = Math.floor(trackPhase * (currentTimbreData.length - 1))
                audioBar.style.height = currentTimbreData[segmentIndex] * 2 + 'px';
            }
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
        <div class="audio-test__bar" bind:this={audioBar}></div>
    </div>
    {#if accessToken === null}
        <SpotifyAuthentication on:accessTokenRecieved={handleAccessTokenRecieved}/>
        {:else}
        <SpotifyPlayer bind:this={spotifyPlayer} bind:playbackPosition={playbackPosition} on:audioAnalysisComplete={handleAvaiableAudioAnalysisComplete}/>
    {/if}
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

  .audio-test {

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    width: 100px;
    height: 100vh;

    &__bar {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: cyan;
      width: 100%;
      transition: height 0.2s;
      height: 100px
    }

  }

</style>
