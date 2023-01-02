<script lang="ts">
import { writable } from "svelte/store";
import { MosaicNode } from "./mosaic";
import Node from "./components/node/Node.svelte";
import SplitBar from "./components/SplitBar.svelte";
import FloatingWindow from "./components/floatingWindow/FloatingWindow.svelte";

let floatingMx = 0;
let floatingMy = 0;
const test = new MosaicNode().init();
const nodeItems = writable(test.root.nodeRendertList);
const splitBarItems = writable(test.root.splitBarRenderList);
const floatingNode = writable(null);
const update = () => {
  console.log("test.root.nodeRendertList", test.root.nodeRendertList);
  test.root.nodeRendertList.clear();
  test.root.splitBarRenderList.clear();
  test.root.getNodeRenderList();
  test.root.getSplitBarRenderList();
  $nodeItems = test.root.nodeRendertList;
  $splitBarItems = test.root.splitBarRenderList;
};

let isFolating = false;
const dnd = {
  mouseDownHandler: (node: MosaicNode, e: MouseEvent) => {
    console.log(document.querySelectorAll(".item__body"));
    node.origin.type = "child";
    $floatingNode = node.origin;
    document.addEventListener("mousemove", dnd.mouseMoveHandler);
    document.addEventListener("mouseup", dnd.mouseUpHandler);
    isFolating = true;
    node.delete();
    update();
  },
  mouseUpHandler: (e) => {
    console.log("mouseUp");
    document.removeEventListener("mousemove", dnd.mouseMoveHandler);

    isFolating = false;

    let location;
    let direction;
    const target = e.target;
    const nodeItem = findAncestorByClass(target, "node__item");
    if (target.classList.contains("guide__item")) {
      if (target.classList.contains("top")) {
        location = "first";
        direction = "column";
      }
      if (target.classList.contains("right")) {
        location = "first";
        direction = "row";
      }
      if (target.classList.contains("bottom")) {
        location = "seconde";
        direction = "column";
      }
      if (target.classList.contains("left")) {
        location = "seconde";
        direction = "row";
      }

      console.log();
      // findAncestorById(target, id);
      if (nodeItem && direction && location && nodeItem.getAttribute("id")) {
        const targetId = nodeItem.getAttribute("id");
        const insertTargetNode = $nodeItems.get(targetId);
        console.log("insertTargetNode", insertTargetNode);
        insertTargetNode.insert(insertTargetNode, location, direction);
      }
      $floatingNode = null;
    }
    // console.log(e.target);
    update();

    // $nodeItems.get()
  },
  mouseMoveHandler: (e: MouseEvent) => {
    floatingMx = e.clientX;
    floatingMy = e.clientY;
  },
};

function findAncestorByClass(el: HTMLElement, className: string) {
  let currentElement = el;
  console.log();
  while (!currentElement.classList.contains(className)) {
    currentElement = currentElement.parentElement;
    if (currentElement.tagName === "HTML") {
      return null;
    }
    // console.log(currentElement);
  }
  return currentElement;
}

function findAncestorById(el: HTMLElement, id: string) {
  let currentElement = el;
  console.log();
  while (currentElement.getAttribute("id") !== id) {
    currentElement = currentElement.parentElement;
    if (currentElement.tagName === "HTML") {
      return null;
    }
    // console.log(currentElement);
  }
  return currentElement;
}
</script>

<main class="h-full w-full bg-[#abb3bf] text-lg text-green-400">
  <button
    class="absolute z-40"
    on:click="{() => {
      update();
    }}">ss</button>
  {#each [...$nodeItems] as item}
    <Node
      node="{item[1]}"
      update="{update}"
      floatNode="{dnd.mouseDownHandler}"
      isFolating="{isFolating}" />
  {/each}

  {#each [...$splitBarItems] as node}
    <SplitBar
      node="{node[1]}"
      boundingBox="{node[1].boundingBox}"
      update="{update}" />
  {/each}

  <FloatingWindow
    node="{$floatingNode}"
    floatingMx="{floatingMx}"
    floatingMy="{floatingMy}" />
</main>
