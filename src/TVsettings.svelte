<script>
  import Peer from "peerjs";
  import { onMount } from "svelte";
  import { toast, Toaster } from "svelte-sonner";

  const { params } = $props()
  let connected = $state(false)
  let conn = $state()

  let channels = $state([])

 onMount(() => {
    const peer = new Peer();

    peer.on('open', async function(id) {
        console.log('client peer ID:', id);
        connected = false
        conn = peer.connect(params.peerId);

        conn.on("open", () => {
            connected = true;
            conn.send({
                type: "id",
                id: id
            });
        });

        conn.on('data', function(data) {

            if (data.type === "channels") {
                channels = data.channels
            }

            if (data.type === "response") {
                let {status,message,remainingChannels} = data.response
                if (status === "success") {
                    toast.success(message)
                    name = ""
                    url = ""
                    channels  = remainingChannels
                } else {
                    toast.error(message)
                }
            }
        });
    });
 })

 const removeChannel = async (id) => {
    conn.send({
        type: "delete",
        id: id
    })
 }

 let name = $state("")
 let url = $state("")
 const addChannel = async (e) => {
    e.preventDefault()
    conn.send({
        type: "add",
        data: {
            name: name,
            url: url
        }
    })
 }
</script>

{#if connected}
<div class="max-w-11/12 mx-auto mt-5">
    <form class="join w-full" onsubmit={addChannel}>
        <input class="input join-item w-1/3" placeholder="name" bind:value={name} required/>
        <input class="input join-item w-2/3" placeholder="url" bind:value={url} required/>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button class="btn join-item rounded-r-full btn-primary" type="submit">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-diamond-plus-icon lucide-diamond-plus"><path d="M12 8v8"/><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/><path d="M8 12h8"/></svg>
        </button>
    </form>
    <br/>
    <br/>
<div class="overflow-x-auto">
  <table class="table table-zebra">
    <!-- head -->
    <thead>
      <tr class="text-center">
        <th></th>
        <th>#</th>
        <th>Name</th>
        <th>URL</th>
      </tr>
    </thead>
    <tbody>
        {#each channels as channel}
        <tr>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <th><button class="btn btn-xs btn-ghost" onclick={() => removeChannel(channel.id)}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></th>
            <td>{channel.id}</td>
            <td>{channel.name}</td>
            <td class="break-all whitespace-normal">{channel.url}</td>
        </tr>
        {/each}
    </tbody>
  </table>
</div>
</div>
{:else}
<div class="max-w-1/2 mx-auto mt-5 text-center">
    <div class="loader">
    Connecting...
    </div>
</div>
{/if}

<Toaster position="bottom-right" expand={false} richColors/>


<style>
    .loader {
        margin: 10% auto;
        width: calc(160px / 0.707);
        height: 28px;
        background: repeating-linear-gradient(-45deg, #766DF4 0 30px,#0000 0 40px) left/200% 100%;
        animation: i3 2s infinite linear;
        border-radius: 10px;
        border: 1px solid #766DF4;
        }

        @keyframes i3 {
        100% {
            background-position: right
        }
        }
</style>
