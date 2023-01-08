<script lang="ts">
import type { MosaicNode } from "../../mosaic";

export let node: MosaicNode;
</script>

<div class="item__body relative flex flex-1 flex-col overflow-y-auto ">
  <div class="guideList">
    <div
      class="guide__item top absolute top-0 h-[20%] w-full border-2 border-solid border-[#4c90f0] bg-[rgba(138,187,255,.2)] ">
    </div>
    <div
      class="guide__item right absolute right-0 h-full w-[20%] border-2 border-solid border-[#4c90f0] bg-[rgba(138,187,255,.2)] ">
    </div>
    <div
      class="guide__item bottom absolute  bottom-0 h-[20%] w-full border-2 border-solid border-[#4c90f0] bg-[rgba(138,187,255,.2)] ">
    </div>
    <div
      class="guide__item left absolute left-0 h-full w-[20%] border-2 border-solid border-[#4c90f0] bg-[rgba(138,187,255,.2)] ">
    </div>
  </div>
  <p>
    {node.data}
  </p>
  <p>
    <span>node Id:</span><span class=" text-yellow-400"> {node.id}</span>
  </p>
  {#if node?.parent?.id}
    <p>
      <span>parent Id:</span><span class=" text-red-500">
        {node?.parent.id}</span>
    </p>
  {/if}
  {#if node?.origin?.id}
    <p>
      <span>origin Id:</span><span class=" text-red-500">
        {node?.origin.id}</span>
    </p>
  {/if}
  <!-- <p>
    <span>node direction:</span><span class=" text-red-500">
      {node.direction}</span>
  </p>


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
  {/if} -->
  <div class="mosaic-window-body">
    <h4>Window 3</h4>
    <span class="default-preview-icon bp4-icon-application bp4-icon-large"
    ></span>
  </div>
</div>
