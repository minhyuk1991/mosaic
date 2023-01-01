<script lang="ts">
import type { MosaicNode } from "../../mosaic";

export let node: MosaicNode;
</script>

<div class="flex flex-1 flex-col overflow-y-auto pl-[15px]">
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
</div>
