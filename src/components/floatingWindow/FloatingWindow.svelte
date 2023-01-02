<script lang="ts">
import type { MosaicNode } from "../../mosaic";

export let node: MosaicNode = null;
export let floatingMx;
export let floatingMy;
</script>

{#if node}
  <div
    class="pointer-events-none absolute translate-x-[-50%] translate-y-[-50%]"
    style="{`top:${floatingMy}px; left:${floatingMx}px`}">
    <p>floatingNode</p>
    <div>{node.id}</div>
  </div>
{/if}
