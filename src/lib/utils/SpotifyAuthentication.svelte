<script>

    import {onMount, createEventDispatcher} from "svelte";

    //-----------------------------------

    //-----------------------------------

    const dispatch = createEventDispatcher();
    const stateKey = 'spotify_auth_state';

    //TODO: THERE IS NO PROPER HANDLING FOR WHEN A TOKEN RUNS OUT. CHECK EXAMPLES AGAIN FOR HOW COOKIES / TOKENS ARE HANDLED

    onMount(() => {
        getAccessToken();
    })

    //TODO: REMOVE ACCESS TOKEN AFTER X TIME TO PREVENT ERRORS DUE TO OLD ACCESS TOKENS
    const getAccessToken = () => {

        let params = getHashParams();

        let access_token = params.access_token,
            state = params.state,
            storedState = localStorage.getItem(stateKey);

        if (access_token && (state === null || state !== storedState)) {
            alert('There was an error during the authentication');
            // return;
        } else {
            localStorage.removeItem(stateKey);
            if (access_token) {
                dispatch('accessTokenRecieved', {
                    token: access_token
                })
            }
        }
    }

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    /**
     * Generates a random string containing numbers and letters
     * @param  {number} length The length of the string
     * @return {string} The generated string
     */
    function generateRandomString(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    const handleClick = (e) => {

        e.preventDefault();

        var client_id = 'd6aba07484274df39a3fda627e8bc331'; // Your client id
        var redirect_uri = 'http://localhost:8080/soundScape'; // Your redirect uri

        var state = generateRandomString(16);

        localStorage.setItem(stateKey, state);
        var scope = "streaming user-read-email user-read-private user-read-playback-position user-read-playback-state";

        var url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(client_id);
        url += '&scope=' + encodeURIComponent(scope);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
        url += '&state=' + encodeURIComponent(state);

        window.location = url;

    }

</script>
<button class="login-button" on:click={handleClick}>Log in</button>
<svelte:head>
</svelte:head>
<style lang="scss">

  .login-button {
    font-family: Arial;
    cursor: pointer;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 50px;
    border-radius: 999999px;
    border: 0px;
    background-color: aqua;
    text-align: center;
    color: white;
    font-size: 18px;
    z-index: 99999;
  }

</style>
