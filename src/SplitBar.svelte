<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { component_subscribe } from "svelte/internal";
import type { MosaicNode } from "./mosaic";

export let update: () => void;
export let node: MosaicNode;
export let boundingBox: MosaicNode["boundingBox"];

let isMouseDown: boolean = false;

const mousedownHandler = (
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement;
  }
) => {
  isMouseDown = true;
  document.addEventListener("mouseup", mouseupHandler);
  document.addEventListener("mousemove", mousemoveHandler);
};

const mouseupHandler = (
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement;
  }
) => {
  if (isMouseDown) {
    isMouseDown = false;
    document.removeEventListener("mousemove", mousemoveHandler);
    document.removeEventListener("mouseup", mouseupHandler);
  }
};

const mousemoveHandler = (e) => {
  if (isMouseDown) {
    const { top, bottom, left, right } = boundingBox;
    const width = 100 - left - right;
    const height = 100 - top - bottom;
    const currentMouseX = (e.clientX / window.innerWidth) * 100;
    const currentMouseY = (e.clientY / window.innerHeight) * 100;
    const [start, end] = [
      {
        x: left,
        y: top,
      },
      {
        x: width === 100 ? 100 : left + width,
        y: height === 100 ? height : top + height,
      },
    ];
    render(currentMouseX, currentMouseY, start, end);
    function render(
      mx: number,
      my: number,
      start: { x: number; y: number },
      end: { x: number; y: number }
    ) {
      // node.splitPercent = (e.clientX / width) * 0.01;
      if (mx > start.x && my > start.y && mx < end.x && my < end.y) {
        if (node.direction === "row") {
          const calcMx = (e.clientX / window.innerWidth) * 100 - left;
          node.splitPercent = (calcMx / width) * 100;
          node.resizingOrder();
          update();
        }
        if (node.direction === "column") {
          const calcMy = (e.clientY / window.innerHeight) * 100 - top;
          node.splitPercent = (calcMy / height) * 100;
          node.resizingOrder();
          update();
        }
      }
    }
  }
};

onMount(() => {
  const split_bar = document.querySelector(`#split_bar_${node.id}`);
  split_bar.addEventListener("mousedown", mousedownHandler);
});

onDestroy(() => {
  const split_bar = document.querySelector(`#split_bar_${node.id}`);
  document.removeEventListener("mouseup", mouseupHandler);
  document.removeEventListener("mousemove", mousemoveHandler);
  split_bar.removeEventListener("mousedown", mousedownHandler);
});
</script>

<div
  id="{`split_bar_${node.id}`}"
  style="{`inset: 
  ${
    //top
    node?.direction === 'row'
      ? boundingBox.top
      : boundingBox.top +
        (100 - boundingBox.top - boundingBox.bottom) * node.splitPercent * 0.01
  }% 
  ${
    //right 기존 여백 + (넓이) * 비
    node?.direction === 'row'
      ? boundingBox.right +
        (100 - boundingBox.left - boundingBox.right) * node.splitPercent * 0.01
      : boundingBox.right
  }% 
  ${
    //bottom
    node?.direction === 'row'
      ? boundingBox.bottom
      : boundingBox.bottom +
        (100 - boundingBox.top - boundingBox.bottom) * node.splitPercent * 0.01
  }%
  ${
    //left
    node?.direction === 'row'
      ? boundingBox.left +
        (100 - boundingBox.left - boundingBox.right) * node.splitPercent * 0.01
      : boundingBox.left
  }%
  
  `}"
  class="{`split-bar select-none ${
    node?.direction === 'row'
      ? 'right-[-6px] top-0 w-[6px] translate-x-[-50%]'
      : 'bottom-[-6px] h-[7px] translate-y-[-50%]'
  }  absolute  z-10   bg-red-500 
  
  ${isMouseDown ? 'bg-orange-400' : ''}
  
  ${node.direction === 'row' ? 'cursor-ew-resize' : 'cursor-ns-resize'}
  `} 
  

  ">
</div>
