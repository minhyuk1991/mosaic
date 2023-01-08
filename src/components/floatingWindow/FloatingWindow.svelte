<script lang="ts">
import type { MosaicNode } from "../../mosaic";
import IconApllication from "../node/icons/IconApllication.svelte";

export let node: MosaicNode = null;
export let floatingMx;
export let floatingMy;
</script>

{#if node}
  <div
    class=" node__item pointer-events-none absolute min-w-[200px] translate-x-[-50%] translate-y-[-50%] cursor-move select-none bg-[#f6f7f9] text-sm opacity-25"
    style="{`top:${floatingMy}px; left:${floatingMx}px`}">
    <div class="item__header flex"></div>
    <div class="item__body relative flex flex-1 flex-col overflow-y-auto">
      <div
        class="item__header--title__area flex h-[30px] flex-1 items-center justify-center pl-[10px] text-[14px] font-semibold leading-[30px]">
        Window
      </div>
      <div class="flex justify-center">
        <IconApllication />
      </div>
    </div>
  </div>
{/if}
