<script lang="ts">
import type { MosaicNode } from "../../mosaic";
import NodeBody from "./NodeBody.svelte";
import NodeHeader from "./NodeHeader.svelte";
export let isFolating: boolean;
export let update: () => void;
export let node: MosaicNode;
export let floatNode: (node: MosaicNode, e: MouseEvent) => void;
let { top, bottom, right, left } = node.boundingBox;
let parentIsChildHide = node.parent.isChildHide;
let parentChildHideLocation = node.parent.childHideLocation;
let isHide = parentChildHideLocation === node.location;
//부모가 차일드하이드를 가지고 있나
// 이즈하이드===부모가 값이 있고, 그게 내 로케이션과 맞을때.
$: {
  parentIsChildHide = node.parent.isChildHide;
  // console.log("parentIsChildHide", parentIsChildHide);
  // console.log("isHide", isHide);
  parentChildHideLocation = node.parent.childHideLocation;
  isHide = parentChildHideLocation === node.location;
  // if (parentIsChildHide) {
  //   if (!isHide) {
  //     top = node.parent.boundingBox.top;
  //     left = node.parent.boundingBox.left;
  //     right = node.parent.boundingBox.right;
  //     bottom = node.parent.boundingBox.bottom;
  //   }
  // }
  // if (!parentIsChildHide) {
  top = node.boundingBox.top;
  right = node.boundingBox.right;
  left = node.boundingBox.left;
  bottom = node.boundingBox.bottom;
  // }
  [node];
}
</script>

<div
  style="{`inset: ${top}% ${right}% ${bottom}% ${left}%`}"
  id="{node.origin.id}"
  class="{`node__item ${isFolating ? 'active' : ''} ${
    isHide ? 'hidden' : 'flex'
  }
    absolute m-[3px] select-none flex-col bg-[#f6f7f9] text-sm`}">
  <NodeHeader node="{node}" update="{update}" floatNode="{floatNode}" />
  <NodeBody node="{node}" />
</div>
