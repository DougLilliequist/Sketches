<script>

    import {ACCESSTOKENKEY} from "$lib/_globals";
    import {onMount, createEventDispatcher} from "svelte";
    import SpotifyWebApi from 'spotify-web-api-js';

    //--------------------------------

    export let playbackPosition;

    //--------------------------------

    let spotifySDK;
    let player;
    let spotifyApi;
    let accessToken;
    let trackAnalysisAcquired = false;
    let prevTrackID = null;
    let playerReady = false;

    const dispatch = createEventDispatcher();

    onMount(() => {

        accessToken = localStorage.getItem(ACCESSTOKENKEY);
        if (accessToken === undefined) {
            console.error('no valid access token provided')
            return;
        }

        initAPI();
        initSpotifyPlayer();
    })

    const initAPI = () => {

        spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);

    }

    const initSpotifyPlayer = () => {

        spotifySDK = document.createElement('script');
        spotifySDK.src = "https://sdk.scdn.co/spotify-player.js";
        spotifySDK.async = false;
        spotifySDK.defer = true;
        document.head.append(spotifySDK);

        window.onSpotifyWebPlaybackSDKReady = () => {
            player = new Spotify.Player({
                name: 'Sound Scape Player',
                getOAuthToken: cb => {
                    cb(accessToken);
                }
            });

            // Error handling
            player.addListener('initialization_error', ({message}) => {
                console.error(message);
            });
            player.addListener('authentication_error', ({message}) => {
                console.error(message);
            });
            player.addListener('account_error', ({message}) => {
                console.error(message);
            });
            player.addListener('playback_error', ({message}) => {
                console.error(message);
            });

            // Playback status updates
            player.addListener('player_state_changed', ({track_window}) => {
                if (track_window === null) return;
                // const {track_window} = state;
                if (track_window) {
                    trackAnalysisAcquired = false;
                    const {current_track} = track_window;
                    if (current_track.id) {

                        //don't know why that's the case yet, but I want to prevent
                        //unnecessary API calls for tracks that are currently found
                        if(current_track.id === prevTrackID) return;
                        getAudioAnalysis({id: current_track.id})
                        prevTrackID = current_track.id;
                    }
                }
            });

            // Ready
            player.addListener('ready', ({device_id}) => {
                console.log('Ready with Device ID', device_id);
                setTimeout(() => {
                    playerReady = true;
                    fetch('https://api.spotify.com/v1/me/player', {
                        method: "PUT",
                        body: JSON.stringify({
                            device_ids: [
                                device_id
                            ],
                            play: false
                        }),
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }).catch(e => console.error(e));
                }, 100);
            });

            // Not Ready
            player.addListener('not_ready', ({device_id}) => {
                console.log('Device ID has gone offline', device_id);
            });

            // Connect to the player!
            player.connect();

        }

    }

    //dispatch and send data to parent component via event dispatcher
    const getAudioAnalysis = ({id}) => {
        if(trackAnalysisAcquired === false) {
            spotifyApi.getAudioFeaturesForTrack(id).then((audioFeatures) => {
                spotifyApi.getAudioAnalysisForTrack(id).then((audioAnalysisData) => {

                    dispatch('audioAnalysisComplete', {
                        audioFeatures,
                        audioAnalysisData
                    });

                    trackAnalysisAcquired = true;
                })
            })
        }
    }

    export const  getCurrentPlayerState = () => {

        if(player && playerReady) {

            player.getCurrentState().then(state => {

                if (!state) {
                    console.error('User is not playing music through the Web Playback SDK');
                    return;
                }

                playbackPosition = state.position;

            })

        }

    }

</script>