<script lang="ts">
import { writable } from "svelte/store";
import { MosaicNode } from "./mosaic";
import Node from "./components/node/Node.svelte";
import SplitBar from "./components/SplitBar.svelte";
import FloatingWindow from "./components/floatingWindow/FloatingWindow.svelte";
import { onMount } from "svelte";

let floatingMx = 0;
let floatingMy = 0;
let hideParentNode: MosaicNode;
let hideNodeLocation;
let selectedDeletNode;
let mainEl;
let isTopLevelInsert = false;
let topLevelInsertDirection;
let topLevelInsertLocation;
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

onMount(() => {
  mainEl = document.querySelector(".main");
});
let isFolating = false;
const dnd = {
  mouseDownHandler: (node: MosaicNode, e: MouseEvent) => {
    console.log(document.querySelectorAll(".item__body"));
    // node.origin.type = "child";\
    console.log("node", node.location);
    $floatingNode = node;
    document.addEventListener("mousemove", dnd.mouseMoveHandler);
    document.addEventListener("mouseup", dnd.mouseUpHandler);
    isFolating = true;
    // node.delete();
    selectedDeletNode = node;
    hideNodeLocation = node.location;
    hideParentNode = node.parent;
    hideParentNode.isChildHide = true;
    hideParentNode.childHideLocation = node.location;
    console.log(hideParentNode);
    update();
  },

  mouseMoveHandler: (e: MouseEvent) => {
    let nextTopLevelDirection;
    //top
    if (e.clientY < 3) {
      topLevelInsertLocation = "first";
      topLevelInsertDirection = "column";
      nextTopLevelDirection = "top";
    }
    //bottom
    if (e.clientY > window.innerHeight - 3) {
      topLevelInsertLocation = "second";
      topLevelInsertDirection = "column";
      nextTopLevelDirection = "bottom";
    }
    //left
    if (
      (e.clientY > 3 && e.clientX < 3) ||
      (e.clientY < window.innerHeight - 3 && e.clientX < 3)
    ) {
      topLevelInsertLocation = "first";
      topLevelInsertDirection = "row";
      nextTopLevelDirection = "left";
    }
    //right
    if (
      (e.clientY > 3 && e.clientX > window.innerWidth - 3) ||
      (e.clientY < window.innerHeight - 3 && e.clientX > window.innerWidth - 3)
    ) {
      topLevelInsertLocation = "second";
      topLevelInsertDirection = "row";
      nextTopLevelDirection = "right";
    }
    if (nextTopLevelDirection) {
      isTopLevelInsert = true;
      mainEl.classList.add("moving");
    } else {
      isTopLevelInsert = false;
      mainEl.classList.remove("moving");
    }
    // //top
    // const topLevelColumnFirst = e.clientY < 3;
    // //bottom
    // const topLevelColumnSecond = e.clientY > window.innerHeight - 3;
    // //left
    // const topLevelRowFirst =
    //   (e.clientY > 3 && e.clientX < 3) ||
    //   (e.clientY < window.innerHeight - 3 && e.clientX < 3);
    // //right
    // const topLevelRowSecond =
    //   (e.clientY > 3 && e.clientX > window.innerWidth - 3) ||
    //   (e.clientY < window.innerHeight - 3 && e.clientX > window.innerWidth - 3);

    floatingMx = e.clientX;
    floatingMy = e.clientY;
    mainEl.classList.remove("top");
    mainEl.classList.remove("right");
    mainEl.classList.remove("bottom");
    mainEl.classList.remove("left");
    if (nextTopLevelDirection) mainEl.classList.add(nextTopLevelDirection);
  },
  mouseUpHandler: (e) => {
    console.log("mouseUp");
    document.removeEventListener("mousemove", dnd.mouseMoveHandler);
    document.removeEventListener("mouseup", dnd.mouseUpHandler);
    // hideNodeLocation = node.location;
    // hideParentNode = node.parent;
    // node.parent.hideChild(node.location);
    // hideParentNode.isChildHide = false;
    // hideParentNode.childHideLocation = null;
    const target = e.target;
    const nodeItem = findAncestorByClass(target, "node__item");

    if (isTopLevelInsert) {
      hideParentNode.hideChild(null);
      selectedDeletNode.delete();
      test.topLevelInsert({
        insertNode: $floatingNode,
        location: topLevelInsertLocation,
        direction: topLevelInsertDirection,
      });
      // $floatingNode = null;
      // topLevelInsertLocation = null;
      // topLevelInsertDirection = null;
    } else {
      if (nodeItem && target.classList.contains("guide__item")) {
        let location;
        let direction;
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
        if (nodeItem && direction && location) {
          hideParentNode.hideChild(null);
          selectedDeletNode.delete();
          // update();
          console.log(
            "***************************nodeItem && direction && location && nodeItem.getAttribute"
          );
          const targetId = nodeItem.getAttribute("id");
          const isSameParent =
            selectedDeletNode.parent ===
            $nodeItems.get(targetId).renderNode.parent;
          console.log(
            "selectedDeletNode.parent===$nodeItems.get(targetId).renderNode.parent",
            selectedDeletNode.parent ===
              $nodeItems.get(targetId).renderNode.parent
          );
          const insertTargetNode = isSameParent
            ? $nodeItems.get(targetId).renderNode.parent
            : $nodeItems.get(targetId).renderNode;
          console.log("insertTargetNode", insertTargetNode);
          insertTargetNode.insert($floatingNode, location, direction);
        }
      }

      if (!nodeItem && !target.classList.contains("guide__item")) {
        console.log("ddddd");
      }
    }
    hideParentNode.isChildHide = false;
    hideParentNode.childHideLocation = null;
    $floatingNode = null;
    isFolating = false;
    update();
    // console.log(e.target);

    // $nodeItems.get()

    mainEl.classList.remove("moving");
  },
};

function findAncestorByClass(el: HTMLElement, className: string) {
  let currentElement = el;
  console.log("el", el);
  if (!el || el.tagName === "HTML") {
    return null;
  }
  while (!currentElement.classList.contains(className)) {
    currentElement = currentElement.parentElement;
    if (currentElement.tagName === "HTML") {
      return null;
    }
    // console.log(currentElement);
  }
  return currentElement;
}

// function findAncestorById(el: HTMLElement, id: string) {
//   let currentElement = el;
//   console.log();
//   while (currentElement.getAttribute("id") !== id) {
//     currentElement = currentElement.parentElement;
//     if (currentElement.tagName === "HTML") {
//       return null;
//     }
//     // console.log(currentElement);
//   }
//   return currentElement;
// }
</script>

<main class="main relative h-full w-full bg-[#abb3bf] text-lg text-green-400">
  <div class="guideList">
    <div
      class="guide__item top absolute top-0 h-[50%] w-full rounded-[2px] border-2 border-solid border-[#4c90f0] bg-[rgba(138,187,255,.2)]">
    </div>
    <div
      class="guide__item right absolute right-0 h-full w-[50%] rounded-[2px] border-2 border-solid border-[#4c90f0] bg-[rgba(138,187,255,.2)]">
    </div>
    <div
      class="guide__item bottom  absolute bottom-0 h-[50%] w-full rounded-[2px] border-2 border-solid border-[#4c90f0] bg-[rgba(138,187,255,.2)]">
    </div>
    <div
      class="guide__item left absolute left-0 h-full w-[50%] rounded-[2px] border-2 border-solid border-[#4c90f0] bg-[rgba(138,187,255,.2)]">
    </div>
  </div>
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
