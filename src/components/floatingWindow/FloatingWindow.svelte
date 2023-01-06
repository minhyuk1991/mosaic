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
    <div
      class="item__header--title__area flex h-[30px] flex-1 items-center bg-red-500 pl-[10px] text-[14px] font-semibold leading-[30px]">
      Window
    </div>
    <p>floatingNode</p>
    <div>{node.id}</div>
  </div>
{/if}
