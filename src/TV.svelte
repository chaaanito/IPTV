<script>
  import { Peer } from "peerjs";
  import QRCode from 'qrcode';
  import { onMount } from "svelte";
  import videojs from "video.js";
  import { addChannel, deleteChannel, getChannels, tv } from "./lib/db.svelte.js";

  let videoEl = null
  let QRImage = $state()
  let player = $state()
  let index = $state(0)

  onMount( async () => {
    //add default channel
    await addChannel("Dubai One",'https://dminnvllta.cdn.mgmlcdn.com/dubaione/smil:dubaione.stream.smil/chunklist.m3u8')

    tv.channels = await getChannels()

    await updatePlayer()


    //this will force WebRTC to use LAN mode, but still it needs to check in the signalling server from peerJS
    const peer = new Peer(localStorage.getItem("server_id") || "",{
      config: {
        iceServers: []
      }
    });

    peer.on('open', async function(id) {
        localStorage.setItem('server_id', id)
        console.log(window.location.href + "#/" + id);
        
        QRImage = await QRCode.toDataURL(window.location.href +"#/" + id, {
            errorCorrectionLevel: 'L',
        })
    });
    
    peer.on("connection", (conn) => {
        conn.on("data", async (data) => {

                if (data.type === "id") {
                    conn.send({ type: "channels", channels: tv.channels });
                }

                if (data.type === 'delete') {
                   let response = await deleteChannel(data.id)
                   if (response) {
                    conn.send({ type: "response", response: response});
                   }
                }

                if (data.type === 'add') {
                   let response = await addChannel(data.data.name,data.data.url)
                   if (response) {
                    conn.send({ type: "response", response: response});
                   }
                }
            });
        })
    })

  const updatePlayer = async () => {
      let container = document.getElementById('video-container')

      let videoEl = document.createElement('video')
          videoEl.setAttribute('id','video-player')
          videoEl.classList.add('video-js','vjs-default-skin','vjs-big-play-centered')
          videoEl.setAttribute('controls','')

          container.appendChild(videoEl)

      player = videojs('video-player', {
                      fullscreen: true,
                      autoplay: true,
                      preload: true,
                      controlBar: false,
                })

      player.src({
        src: tv.channels[index]?.url,
        type: 'application/vnd.apple.mpegurl'
      })
  }

  const prev = async () => {
    if (index > 0) {
        index--
     }else if (index === 0) {
        index = tv.channels.length - 1
    }

    if (player) {
      player.dispose()
    }

    await updatePlayer()
    player.play()
  }

  const next = async () => {
    if (index < tv.channels.length - 1) {
      index++
    }else if (index === tv.channels.length - 1) {
      index = 0
    }

    if (player) {
      player.dispose()
    }

    await updatePlayer()
    player.play()
  }
</script>

<div class="navbar fixed top-1 z-10">
  <div class="flex-1">
    <div class="text-xl ml-10">{tv.channels[index]?.name}</div>
  </div>
  <div class="flex-none">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <!-- <button class="mr-5 hover:text-primary"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg></button> -->
  </div>
</div>

<div id='video-container' class="w-[100vw] h-[100vh]"></div>

<div class="fixed bottom-0 left-0 z-50 w-full h-[200px] opacity-0 transition-opacity duration-[2000ms] hover:opacity-100 hover:duration-[150ms]">
    <!-- svelte-ignore a11y_consider_explicit_label -->
  <div class="controllers flex flex-row w-400px justify-center gap-10">
    <button onclick={() => prev()} class="hover:text-primary transition-opacity duration-[500ms]"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-left-dash-icon lucide-arrow-big-left-dash"><path d="M13 9a1 1 0 0 1-1-1V5.061a1 1 0 0 0-1.811-.75l-6.835 6.836a1.207 1.207 0 0 0 0 1.707l6.835 6.835a1 1 0 0 0 1.811-.75V16a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1z"/><path d="M20 9v6"/></svg></button>
    <button onclick={() => player.play()} class="hover:text-primary transition-opacity duration-[500ms]"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg></button>
    <button onclick={() => {player.currentTime(0); player.pause();}} class="hover:text-primary transition-opacity duration-[500ms]"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-stop-icon lucide-circle-stop"><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg></button>
    <button onclick={() => next()} class="hover:text-primary transition-opacity duration-[500ms]"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-right-dash-icon lucide-arrow-big-right-dash"><path d="M11 9a1 1 0 0 0 1-1V5.061a1 1 0 0 1 1.811-.75l6.836 6.836a1.207 1.207 0 0 1 0 1.707l-6.836 6.835a1 1 0 0 1-1.811-.75V16a1 1 0 0 0-1-1H9a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"/><path d="M4 9v6"/></svg></button>
  </div>
  
{#if QRImage}
<div class="tooltip fixed bottom-20 left-5 z-50 tooltip-ghost tooltip-right">
  <div class="tooltip-content">
    <div class=" text-2xl font-black"><img src="{QRImage}" alt="qr"></div>
  </div>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scan-qr-code-icon lucide-scan-qr-code"><path d="M17 12v4a1 1 0 0 1-1 1h-4"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M17 8V7"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M7 17h.01"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><rect x="7" y="7" width="5" height="5" rx="1"/></svg>
</div>
{/if}
</div>