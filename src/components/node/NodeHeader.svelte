<script>
import IconCross from "./icons/IconCross.svelte";
import IconSplit from "./icons/IconSplit.svelte";

export let update;
export let node;
</script>

<div class="item__header flex cursor-move">
  <div
    class="item__header--title__area flex h-[30px] flex-1 items-center pl-[10px] text-[14px] font-semibold leading-[30px]">
    Window
  </div>
  <div class="item__header--button__area flex">
    <button
      class="flex h-[30px] w-[30px] items-center justify-center"
      on:click="{() => {
        node.split();
        update();
      }}">
      <span class="sr-only">split</span>
      <span
        class="flex h-[16px] w-[16px] items-center justify-center align-middle">
        <IconSplit />
      </span>
    </button>
    {#if (node.type = "child")}
      <button
        class="flex h-[30px] w-[30px] items-center justify-center"
        on:click="{() => {
          node.delete();
          update();
        }}">
        <span class="sr-only">delete</span>
        <span
          class="flex h-[16px] w-[16px] items-center justify-center align-middle">
          <IconCross />
        </span>
      </button>
    {/if}
  </div>
</div>
