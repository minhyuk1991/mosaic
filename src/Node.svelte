<script lang="ts">
import type { MosaicNode } from "./mosaic";
export let update: () => void;
export let node: MosaicNode;
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
  <div class="relative z-10">
    <button
      on:click="{() => {
        node.split();
        update();
      }}">split</button>
    <button
      on:click="{() => {
        node.delete();
        update();
      }}">
      delete</button>
    <button
      on:click="{() => {
        node.updateSplitPercentOrder();
        update();
      }}">
      node</button>
  </div>
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
  <!-- {#if node.location === "first"}
    {node.parent}
    <div
      class="{`${
        node?.parent?.direction === 'row'
          ? 'right-[-6px] top-0 h-full w-[6px]'
          : 'bottom-[-6px] h-[7px] w-full'
      }  absolute  z-10 bg-red-500`}">
    </div>
  {/if} -->
</div>
