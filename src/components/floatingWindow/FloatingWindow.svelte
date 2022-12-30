<script lang="ts">
import type { MosaicNode } from "../../mosaic";

export let node: MosaicNode = null;
</script>

{#if node}
  <div class="absolute">
    <p>floatingNode</p>
    <div>{node.id}</div>
  </div>
{/if}
