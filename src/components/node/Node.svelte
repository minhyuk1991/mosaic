<script lang="ts">
import type { MosaicNode } from "../../mosaic";
import NodeBody from "./NodeBody.svelte";
import NodeHeader from "./NodeHeader.svelte";
export let isFolating: boolean;
export let update: () => void;
export let node: MosaicNode;
export let floatNode: (node: MosaicNode, e: MouseEvent) => void;
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
  id="{node.origin.id}"
  class="{`node__item ${
    isFolating ? 'active' : ''
  }  absolute m-[3px] flex select-none flex-col bg-[#f6f7f9] text-sm`}">
  <NodeHeader node="{node}" update="{update}" floatNode="{floatNode}" />
  <NodeBody node="{node}" />
</div>
