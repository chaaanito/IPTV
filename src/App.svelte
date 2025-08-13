<script>
  import Router from "svelte-spa-router";
  import Tv from "./TV.svelte";
  import TVsettings from "./TVsettings.svelte";

  const routes = {
    "/" : Tv,
    "/:peerId": TVsettings,
    "*": Tv
  }
</script>

<Router {routes}/>