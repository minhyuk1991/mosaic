<script lang="ts">
import { onMount, onDestroy } from "svelte";
import type { MosaicNode } from "./mosaic";

export let update: () => void;
export let node: MosaicNode;
export let boundingBox: MosaicNode["boundingBox"];

$: {
  boundingBox = node.boundingBox;
}
console.log("node", node, node.direction === "row");
console.log("render split bar");
console.log(node.splitPercent * 0.01);
console.log(
  (100 - node.parent?.boundingBox.left - node.parent?.boundingBox.right) *
    node.splitPercent *
    0.01
);

let isMouseDown: boolean = false;

const mousedownHandler = (
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement;
  }
) => {
  console.log("mouse down");
  console.log("e", e.currentTarget);
  isMouseDown = true;
  document.addEventListener("mouseup", mouseupHandler);
  document.addEventListener("mousemove", mousemoveHandler);
};

const mouseupHandler = (
  e: MouseEvent & {
    currentTarget: EventTarget & HTMLDivElement;
  }
) => {
  console.log("mouseupHandlerHandler");
  console.log("mouseup");
  console.log("mouseup isMouseDown", isMouseDown);
  if (isMouseDown) {
    console.log("dd");
    console.log(isMouseDown);
    isMouseDown = false;
    console.log("mouseup isMouseDown end", isMouseDown);
  }
};

const mousemoveHandler = (e) => {
  if (isMouseDown) {
    const { top, bottom, left, right } = boundingBox;
    const width = 100 - left - right;
    const height = 100 - top - bottom;
    console.log(width, height);
    const [start, end] = [
      {
        x: width === 100 ? 0 : window.innerWidth * left * 0.01,
        y: height === 100 ? 0 : window.innerHeight * top * 0.01,
      },
      {
        x: width === 100 ? window.innerWidth : window.innerWidth * right * 0.01,
        y:
          height === 100
            ? window.innerHeight
            : window.innerHeight * bottom * 0.01,
      },
    ];
    console.log(start, end);
    console.log(e.clientX, e.clientY);
    if (node.direction === "row") {
      if (
        e.clientX > start.x &&
        e.clientY > start.y &&
        e.clientX < end.x &&
        e.clientY < end.y
      ) {
        node.splitPercent = (e.clientX / window.innerWidth) * 100;
        console.log("node.splitPercent", node.splitPercent);
        node.updateSplitPercentOrder();
        update();
      }

      console.log((e.clientX / width) * 100);
    }
    if (node.direction === "column") {
      if (
        e.clientX > start.x &&
        e.clientY > start.y &&
        e.clientX < end.x &&
        e.clientY < end.y
      ) {
        node.splitPercent = (e.clientY / window.innerHeight) * 100;
        console.log("node.splitPercent", node.splitPercent);
        node.updateSplitPercentOrder();
        update();
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

function getSize(node: MosaicNode, direction: "row" | "column") {
  if (direction === "row") {
  }
  if (direction === "column") {
  }
}
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
    //right
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
  
  ${isMouseDown ? 'bg-orange-400' : ''}`} cursor-pointer">
</div>
