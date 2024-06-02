<main>
    <ul>
        <li><a href="/strangeSphere">Strange Sphere</a><li>
        <!-- <li><a href="/wandering">Wandering</a><li> -->
        <!-- <li><a href="/bloom">Bloom</a><li> -->
        <!-- <li><a href="/soundScape">Sound Scape</a><li> -->
        <li><a href="/alienConstruct">Alien Construct</a><li>
        <li><a href="/fluidParticles">Fluid Particles</a><li>
        <li><a href="/matrix">Matrix</a><li>
        <li><a href="/fluid2d">Fluid2D</a><li>
        <li><a href="/reactionDiffusion">Reaction Diffusion</a><li>
        <li><a href="/ripple2d">ripple 2d</a><li>
        <li><a href="/jumpflooding">jump flooding</a><li>
        <!-- <li><a href="/screenspacefluid">screen space fluid</a><li> -->
        <!-- <li><a href="/softbody">softbody</a><li> -->
        <!-- <li><a href="/temporalaademo">temporal anti-aliasing demo</a><li> -->
        <li><a href="/dissolve">dissolve</a><li>
        <li><a href="/kreatur">kreatur</a><li>
        <!-- <li><a href="/ragdoll">ragdoll</a><li> -->
        <li><a href="/gameoflife">game of life</a><li>
        <!-- <li><a href="/ssaopost">ssao</a><li> -->
        <li><a href="/elastic">elastic</a><li>
        <li><a href="/cloth">cloth</a><li>
    </ul>
</main>

<style lang="scss">

    main {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    ul {
        list-style: none;
        li {
            text-align: center;
            margin: 0.4rem 0;
        }

        a {
            text-decoration: none;
            color: inherit;
            opacity: 0.5;
            transition: opacity 500ms ease;

            &:hover {
                opacity: 1;
            }
        }
    }
    
</style>
