<script lang="ts">
import { writable } from "svelte/store";
import { MosaicNode } from "./mosaic";
import Node from "./Node.svelte";
import SplitBar from "./SplitBar.svelte";

const test = new MosaicNode().init();
const nodeItems = writable(test.root.nodeRendertList);
const splitBarItems = writable(test.root.splitBarRenderList);

// test.first.split();
// test.first.first.split();
// test.first.first.first.split();
// test.first.first.first.first.delete();
const update = () => {
  test.root.nodeRendertList.clear();
  test.root.splitBarRenderList.clear();
  test.root.getNodeRenderList();
  test.root.getSplitBarRenderList();
  $nodeItems = test.root.nodeRendertList;
  $splitBarItems = test.root.splitBarRenderList;
  console.log(test.root);
};

// console.log($nodeItems);
</script>

<main class="h-full w-full text-lg text-green-400">
  {#each [...$nodeItems] as item}
    <Node node="{item[1]}" update="{update}" />
  {/each}

  {#each [...$splitBarItems] as node}
    <SplitBar
      node="{node[1]}"
      boundingBox="{node[1].boundingBox}"
      update="{update}" />
  {/each}
</main>
