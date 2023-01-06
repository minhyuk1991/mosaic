<script lang="ts">
import { writable } from "svelte/store";
import { MosaicNode } from "./mosaic";
import Node from "./components/node/Node.svelte";
import SplitBar from "./components/SplitBar.svelte";
import FloatingWindow from "./components/floatingWindow/FloatingWindow.svelte";

let floatingMx = 0;
let floatingMy = 0;
let prevTree: MosaicNode | null = null;
const test = new MosaicNode().init();
const nodeItems = writable(test.root.nodeRendertList);
const splitBarItems = writable(test.root.splitBarRenderList);
const floatingNode = writable(null);
const update = () => {
  console.log();
  test.root.nodeRendertList.clear();
  test.root.splitBarRenderList.clear();
  test.root.resizingOrder();
  test.root.getRenderList();
  test.root.getSplitBarRenderList();
  $nodeItems = test.root.nodeRendertList;
  $splitBarItems = test.root.splitBarRenderList;
};

let isFolating = false;
const dnd = {
  mouseDownHandler: (node: MosaicNode, e: MouseEvent) => {
    console.log(document.querySelectorAll(".item__body"));
    // node.origin.type = "child";
    $floatingNode = node;
    document.addEventListener("mousemove", dnd.mouseMoveHandler);
    document.addEventListener("mouseup", dnd.mouseUpHandler);
    isFolating = true;
    node.delete();
    update();
  },
  mouseUpHandler: (e) => {
    console.log("mouseUp");
    document.removeEventListener("mousemove", dnd.mouseMoveHandler);
    document.removeEventListener("mouseup", dnd.mouseUpHandler);
    let location;
    let direction;
    const target = e.target;
    const nodeItem = findAncestorByClass(target, "node__item");
    console.log("==nodeItem==", nodeItem);
    if (target.classList.contains("guide__item")) {
      if (target.classList.contains("top")) {
        location = "first";
        direction = "column";
      }
      if (target.classList.contains("right")) {
        location = "second";
        direction = "row";
      }
      if (target.classList.contains("bottom")) {
        location = "second";
        direction = "column";
      }
      if (target.classList.contains("left")) {
        location = "first";
        direction = "row";
      }

      console.log(`===================${location}`);
      // findAncestorById(target, id);
      if (nodeItem && direction && location && nodeItem.getAttribute("id")) {
        console.log("$nodeItems", $nodeItems);
        const targetId = nodeItem.getAttribute("id");
        const insertTargetNode = $nodeItems.get(targetId).renderNode;
        console.log("insertTargetNode", insertTargetNode);
        insertTargetNode.insert($floatingNode, location, direction);
      }
      $floatingNode = null;
      isFolating = false;
      update();
    }
    // console.log(e.target);

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
  {#each [...$nodeItems] as item}
    <Node
      node="{item[1].renderNode}"
      update="{update}"
      floatNode="{dnd.mouseDownHandler}"
      isFolating="{isFolating}" />
  {/each}

  {#each [...$splitBarItems] as node}
    <SplitBar
      node="{node[1].renderNode}"
      boundingBox="{node[1].renderNode.boundingBox}"
      update="{update}" />
  {/each}

  <FloatingWindow
    node="{$floatingNode}"
    floatingMx="{floatingMx}"
    floatingMy="{floatingMy}" />
</main>
