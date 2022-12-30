<script lang="ts">
import type { MosaicNode } from "../../mosaic";
import NodeHeader from "./NodeHeader.svelte";
export let update: () => void;
export let node: MosaicNode;
export let floatNode: (node: MosaicNode) => void;
let { top, bottom, right, left } = node.boundingBox;
$: {
  ((top = node.boundingBox.top),
  (left = node.boundingBox.left),
  (right = node.boundingBox.right),
  (bottom = node.boundingBox.bottom)),
    [node];
}
</script>

<div
  style="{`inset: ${top}% ${right}% ${bottom}% ${left}%`}"
  class="absolute m-[3px] select-none bg-black text-sm">
  <NodeHeader node="{node}" update="{update}" floatNode="{floatNode}" />
  <p>
    <span>node direction:</span><span class=" text-red-500">
      {node.direction}</span>
  </p>
  <p>
    <span>node Id:</span><span class=" text-yellow-400"> {node.id}</span>
  </p>
  {#if node?.origin?.id}
    <p>
      <span>origin Id:</span><span class=" text-red-500">
        {node?.origin.id}</span>
    </p>
  {/if}
  {#if !node?.origin?.id}
    <p>
      <span>parent Id:</span><span class=" text-red-500">
        {node.parent.id}</span>
    </p>
  {/if}
  {#if node?.parent?.id}
    <p>
      <span>parent Id:</span><span class=" text-red-500">
        {node?.parent.id}</span>
    </p>
  {/if}
</div>
