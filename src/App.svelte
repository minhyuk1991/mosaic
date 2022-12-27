<script lang="ts">
import { writable } from "svelte/store";
import { MosaicNode } from "./mosaic";
import Node from "./Node.svelte";

const test = new MosaicNode().init();
const items = writable(test.root.renderTargetList);
// test.first.split();
// test.first.first.split();
// test.first.first.first.split();
// test.first.first.first.first.delete();
console.log(test);
const update = () => {
  test.root.renderTargetList.clear();
  test.root.getRenderList();
  $items = test.root.renderTargetList;
};
console.log($items);
</script>

<main class="h-full w-full text-lg text-green-400">
  {#each [...$items] as item}
    {#if item[1].type === "child"}
      <Node node="{item[1]}" update="{update}" />
    {/if}
  {/each}
</main>
