<script lang="ts">
import { writable } from "svelte/store";
import { MosaicNode } from "./mosaic";
import Node from "./components/node/Node.svelte";
import SplitBar from "./components/SplitBar.svelte";
import FloatingWindow from "./components/floatingWindow/FloatingWindow.svelte";

const test = new MosaicNode().init();
const nodeItems = writable(test.root.nodeRendertList);
const splitBarItems = writable(test.root.splitBarRenderList);
const floatingNode = writable(null);
const update = () => {
  console.log('test.root.nodeRendertList',test.root.nodeRendertList)
  test.root.nodeRendertList.clear();
  test.root.splitBarRenderList.clear();
  test.root.getNodeRenderList();
  test.root.getSplitBarRenderList();
  $nodeItems = test.root.nodeRendertList;
  $splitBarItems = test.root.splitBarRenderList;
};

const floatNode = (node: MosaicNode) => {
  $floatingNode = node;
  node.delete();
  update();
};
</script>

<main class="h-full w-full bg-[#abb3bf] text-lg text-green-400">
<button class="absolute z-40" on:click="{()=>{
  update()
}}">ss</button>
  {#each [...$nodeItems] as item}
    <Node node="{item[1]}" update="{update}" floatNode="{floatNode}" />
  {/each}

  {#each [...$splitBarItems] as node}
    <SplitBar
      node="{node[1]}"
      boundingBox="{node[1].boundingBox}"
      update="{update}" />
  {/each}

  <FloatingWindow node="{$floatingNode}" />
</main>
