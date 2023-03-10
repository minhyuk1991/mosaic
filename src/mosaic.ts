import { v4 as uuidv4 } from "uuid";

let data = -1;
export class MosaicNode {
  nodeRendertList: Map<
    string,
    { originNode: MosaicNode; renderNode: MosaicNode | null }
  > = null;
  splitBarRenderList: Map<
    string,
    { originNode: MosaicNode; renderNode: MosaicNode }
  >;
  root: MosaicNode | null = null;
  parent: MosaicNode | null = null;
  first: MosaicNode | null = null;
  second: MosaicNode | null = null;
  origin: MosaicNode;
  type: "parent" | "child";
  id: string;
  isChildHide: boolean;
  childHideLocation: null | "second" | "first";
  splitPercent: number;
  isReplica: boolean;
  location: "first" | "second";
  direction: "row" | "column";
  boundingBox: { top: number; bottom: number; left: number; right: number };
  data: number;
  constructor(
    parent?: MosaicNode,
    location?: "first" | "second",
    replicaOption: boolean = false
  ) {
    this.root = parent ? parent.root : this;
    this.parent = parent ? parent : null;
    this.first = null;
    this.second = null;
    this.isChildHide = null;
    this.origin = replicaOption && parent ? parent.origin : this;
    this.id = parent ? uuidv4() : "master";
    this.type = parent ? "child" : "parent";
    this.splitPercent = this.id === "master" ? 100 : 50;
    this.isReplica = replicaOption ? true : false;
    this.nodeRendertList = parent ? parent.nodeRendertList : new Map();
    this.splitBarRenderList = parent ? parent.splitBarRenderList : new Map();
    this.location = location ? location : "first";
    this.direction = parent
      ? parent.direction === "column"
        ? "row"
        : "column"
      : "column";
    this.boundingBox = this.getBoundingBox();
    this.data = (() => {
      if (this.isReplica) {
        return this.origin.data;
      } else {
        data = data + 1;
        return data;
      }
    })();
    console.log(this.direction);
  }
  init() {
    console.log(this);
    const item = new MosaicNode(this);
    this.root.type = "parent";
    this.first = item;
    item.parent = this.root;
    this.root.nodeRendertList.set(item.origin.id, {
      originNode: this.first,
      renderNode: this.first,
    });
    return this;
  }

  getSibilingNode() {
    console.log("getSibilingNode");
    console.log("this", this);
    if (this.parent.first || this.parent.second) {
      console.log();
      const isFirst = this.parent.first.id === this.id;
      return this.parent[isFirst ? "second" : "first"];
    }
  }
  isreplica() {
    return this.origin.id === this.id ? false : true;
  }
  hasChild() {
    return this.first || this.second ? true : false;
  }
  isSameNode(node: MosaicNode) {
    return node.id === this.id;
  }
  getRenderList() {
    this.root.nodeRendertList.clear();
    this.root.renderListCheckOrder();
  }

  getSplitBarRenderList() {
    this.root.splitBarRenderList.clear();
    this.root.splitBarListCheckOrder();
  }

  findChildNodeById(id: string) {
    const hasChild = this.hasChild;
    if (!hasChild) {
      return;
    }

    if (hasChild) {
      const result =
        this.first.id === id
          ? this.first
          : this.second.id === id
          ? this.second
          : null;
      return result;
    }
  }

  split() {
    const isNoChild = !this.first && !this.second;
    //parent ?????? ??? master node /childNode ?????? ???
    if (!this.parent || !isNoChild) return;
    //childNode ?????????
    if (isNoChild) {
      console.log("isNoChild");
      //????????? ?????? ??????, first??? ?????? replica
      this.first = new MosaicNode(this, "first", true);
      console.log(this.first.boundingBox);
      this.second = new MosaicNode(this, "second");
      this.type = "parent";
      this.root.splitBarRenderList.set(this.id, {
        originNode: this.origin,
        renderNode: this,
      });
      this.root.getSplitBarRenderList();
      console.log("====split ??????===!!", this.id, "aaaaaaaa");
      console.log(this.root);
    }
    console.log(this.root);
  }
  delete() {
    console.log("delete");
    if (this.id === "master") throw new Error("this node is master node");
    if (this.parent.id === "master")
      throw new Error("this node parent is master node");
    if (!this.isReplica) deleteFunctions.nomalCase(this);
    if (this.isReplica) deleteFunctions.replicaCase(this);
    console.log(
      "============================delete complate=============================",
      this.root
    );
  }
  topLevelInsert({
    insertNode,
    location,
    direction,
  }: {
    insertNode: MosaicNode;
    location: "first" | "second";
    direction: "row" | "column";
  }) {
    console.log("topLevelInsert");

    if (location === "first") {
      const prevFirst = this.root.first;
      const nextFirst = insertNode;
      this.root.first = nextFirst;
      nextFirst.origin = insertNode;
      nextFirst.parent = this.root;
      nextFirst.location = "first";
      nextFirst.type = "parent";
      nextFirst.direction = direction;
      nextFirst.isReplica = false;

      prevFirst.location = "second";
      nextFirst.first = new MosaicNode(nextFirst, "first", true);
      prevFirst.parent = nextFirst;
      nextFirst.second = prevFirst;
      console.log(this.root);
    }
    if (location === "second") {
      const prevFirst = this.root.first;
      const nextFirst = insertNode;
      this.root.first = nextFirst;
      nextFirst.origin = insertNode;
      nextFirst.parent = this.root;
      nextFirst.location = "second";
      nextFirst.type = "parent";
      nextFirst.direction = direction;
      nextFirst.isReplica = false;
      prevFirst.location = "first";
      nextFirst.second = new MosaicNode(nextFirst, "second", true);
      prevFirst.parent = nextFirst;
      nextFirst.first = prevFirst;
      console.log(this.root);

      // const nextSecond = insertNode;
      // rootFirst.second = nextSecond;
      // nextSecond.origin = nextSecond;
      // nextSecond.parent = rootFirst;
      // nextSecond.location = "second";
      // nextSecond.type = "parent";
      // nextSecond.isReplica = false;
      // nextSecond.direction = direction;

      // nextChildSecond.parent = nextSecond;
      // nextSecond.first = new MosaicNode(nextSecond, "first", true);
      // nextSecond.second = nextChildSecond;
    }
    this.root.resizingOrder();
    this.root.updateSplitPercentOrder();
    this.root.getSplitBarRenderList();
  }
  insert(
    insertNode: MosaicNode,
    location: "first" | "second",
    direction: "row" | "column"
  ) {
    console.log(
      "insert!!",
      `
      target:${this.data}
      node:${insertNode.data}, direction:${direction}, location:${location}`
    );

    //???????????? ??????
    const replicaLocation = location === "first" ? "second" : "first";
    console.log("????????? ?????? ??????", insertNode.id);
    this.direction = direction;
    this.type = "parent";
    this[replicaLocation] = new MosaicNode(this, replicaLocation, true);
    // console.log("???????????????", this[replicaLocation].id === this.id);
    // console.log("???????????????", this[replicaLocation].id === this.id);
    insertNode.origin = insertNode;
    insertNode.location = location;
    insertNode.isReplica = false;
    insertNode.parent = this;
    this[location] = insertNode;
    this.getSplitBarRenderList();
    // this.root.getRenderList();
    // this.root.splitBarRenderList;
    // this.root.splitBarListCheckOrder();

    console.log(this.root);
    console.log("end", this.root);
    this.root.resizingOrder();
    this.root.updateSplitPercentOrder();
    this.root.getSplitBarRenderList();
  }
  getBoundingBox() {
    const rootAndRootFristNode =
      this.id === "master" || this.parent.id === "master";
    if (rootAndRootFristNode) {
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };
    }
    if (!rootAndRootFristNode) {
      const parentSplitPercent = this.parent.splitPercent;
      const parentDirection = this.parent.direction;
      const parentIsChildHide = this.parent.isChildHide;
      const parentChildHideLocation = this.parent.childHideLocation;
      const { top, right, bottom, left } = this.parent.boundingBox;
      const parentWidth = 100 - right - left;
      const parentHeight = 100 - top - bottom;
      const currentItemLocation = this.location;
      const rowAndFirstCase =
        parentDirection === "row" && currentItemLocation === "first";
      const rowAndSecondCase =
        parentDirection === "row" && currentItemLocation === "second";
      const columnAndFirstCase =
        parentDirection === "column" && currentItemLocation === "first";
      const columnAndSecondCase =
        parentDirection === "column" && currentItemLocation === "second";
      if (rowAndFirstCase) {
        if (parentIsChildHide && parentChildHideLocation !== this.location) {
          console.log("dddd");
          return {
            ...this.parent.boundingBox,
          };
        }
        return {
          ...this.parent.boundingBox,
          right: right + parentWidth * (100 - parentSplitPercent) * 0.01,
        };
      }
      if (rowAndSecondCase) {
        if (parentIsChildHide && parentChildHideLocation !== this.location) {
          console.log("dddd");
          return {
            ...this.parent.boundingBox,
          };
        }
        return {
          ...this.parent.boundingBox,
          left: left + parentWidth * parentSplitPercent * 0.01,
        };
      }

      if (columnAndFirstCase) {
        if (parentIsChildHide && parentChildHideLocation !== this.location) {
          console.log("dddd");

          return {
            ...this.parent.boundingBox,
          };
        }
        return {
          ...this.parent.boundingBox,
          bottom: bottom + parentHeight * (100 - parentSplitPercent) * 0.01,
        };
      }
      if (columnAndSecondCase) {
        if (parentIsChildHide && parentChildHideLocation !== this.location) {
          console.log("dddd");
          return {
            ...this.parent.boundingBox,
          };
        }
        return {
          ...this.parent.boundingBox,
          top: top + parentHeight * parentSplitPercent * 0.01,
        };
      }
    }
  }
  parentChildLinkClear() {
    this.parent.first = null;
    this.parent.second = null;
  }
  isRootFirstNode() {
    console.log("isRootFirstNode");
    return this.root.first.id === this.id;
  }

  hasChildNodeById(id) {
    if (this.first && this.first.id === id) {
      return { has: true, node: this.first, location: "first" };
    }
    if (this.first && this.first.id === id) {
      return { has: true, node: this.first, location: "second" };
    }
    return { has: false, node: null, location: null };
  }
  findReplicaChild() {
    return this.origin.id === this.first.origin.id ? this.first : this.second;
  }
  findNonReplicaChild() {
    return this.origin.id === this.first.origin.id ? this.second : this.first;
  }
  findReplicaChildLocation(): null | "first" | "second" {
    let location = null;
    if (this.hasChild()) {
      if (this.first.origin.id === this.origin.id) {
        location = "first";
      }
      if (this.second.origin.id === this.origin.id) {
        location = "second";
      }
    }
    return location;
  }
  findNonreplicaChildLocation(): null | "first" | "second" {
    let location = null;
    if (this.hasChild()) {
      if (this.first.origin.id !== this.origin.id) {
        location = "first";
      }
      if (this.second.origin.id !== this.origin.id) {
        location = "second";
      }
    }
    return location;
  }

  originNodeUpdateAndReversePropagation() {
    if (this.parent.id !== this.root.id) {
      if (this.origin.id === this.parent.origin.id) {
      }
    }
  }
  deleteFirstAndSecond() {
    if (this.hasChild()) {
      this.first = null;
      this.second = null;
      this.type = "child";
    }
  }
  // modifyingToDataOnReceivedNodeOrder(node: MosaicNode) {
  //   const beforeOriginId = this.id;
  //   this.data = node.data;
  //   this.id = node.id;
  //   this.changereplicaChild(this, beforeOriginId);
  // }
  changereplicaChild(
    nextOriginNode: MosaicNode,
    CustomBeforeOriginId?: string
  ) {
    const beforeOriginId = this.origin.id;
    this.origin = nextOriginNode;
    if (this.hasChild()) {
      if (
        this.first.origin.id === CustomBeforeOriginId
          ? CustomBeforeOriginId
          : beforeOriginId
      ) {
        console.log("????????? ?????? ????????? ????????? ??????");
        this.first.originNodeUpdateOrder({ nextOriginNode });
      }
      if (
        this.second.origin.id === CustomBeforeOriginId
          ? CustomBeforeOriginId
          : beforeOriginId
      ) {
        console.log("????????? ?????? ????????? ????????? ??????");
        this.second.originNodeUpdateOrder({ nextOriginNode });
      }
    }
  }
  changeLocationToParentNode() {
    const parentLocation = this.parent.location;
    this.parent = this.parent.parent;
    this.location = parentLocation;
    this.parent.parent[parentLocation] = this;
  }

  originNodeUpdateOrder({
    nextOriginNode,
    onlyDataOverwrite = false,
  }: {
    nextOriginNode: MosaicNode;
    onlyDataOverwrite?: boolean;
    // option: 'dataOnly'|"all"
  }) {
    console.log(" originNodeUpdateOrder ??????");
    const beforeOriginId = this.origin.id;
    let node;
    if (onlyDataOverwrite) {
      this.data = nextOriginNode.data;
      node = this;
    }
    if (!onlyDataOverwrite) {
      this.origin = nextOriginNode;
      node = nextOriginNode;
    }
    if (this.hasChild()) {
      if (this.first.origin.id === beforeOriginId) {
        console.log("????????? ?????? ????????? ????????? ??????");
        this.first.originNodeUpdateOrder({ nextOriginNode: node });
      }
      if (this.second.origin.id === beforeOriginId) {
        console.log("????????? ?????? ????????? ????????? ??????");
        this.second.originNodeUpdateOrder({ nextOriginNode: node });
      }
    }
  }
  resizingOrder() {
    this.boundingBox = this.getBoundingBox();
    if (this.first) {
      this.first.resizingOrder();
    }
    if (this.second) {
      this.second.resizingOrder();
    }
  }

  hideChild(location: "first" | "second" | null) {
    this.isChildHide = true;
    this.childHideLocation = location;
    console.log("hideChild");
    console.log("this.isChildHide", this.isChildHide);
    console.log("childHideLocation", this.childHideLocation);
  }
  splitBarListCheckOrder() {
    const renderTarget = this.id !== "master" && this.type === "parent";
    if (renderTarget) {
      this.root.splitBarRenderList.set(this.id, {
        originNode: this.origin,
        renderNode: this,
      });
    }
    if (this.hasChild) {
      if (this.first) {
        // console.log("first");
        this.first.splitBarListCheckOrder();
      }
      if (this.second) {
        // console.log("second");
        this.second.splitBarListCheckOrder();
      }
    }
  }
  updateSplitPercentOrder() {
    // console.log("before", this.boundingBox);
    // console.log("parent id", this.parent?.id);
    // console.log("parent", this.parent?.boundingBox);
    // console.log("after", this.getBoundingBox());
    this.boundingBox = this.getBoundingBox();
    if (this.hasChild()) {
      if (this.first) {
        this.first.updateSplitPercentOrder();
      }
      if (this.second) {
        this.second.updateSplitPercentOrder();
      }
    }
  }
  renderListCheckOrder() {
    // console.log("renderListCheckOrder??????");
    // console.log("?????? ???????????? ?????? ", this.id);

    if (this.id !== "master") {
      if (this.type === "child") {
        // console.log("case~!");
        this.root.nodeRendertList.set(this.origin.id, {
          originNode: this.origin,
          renderNode: this,
        });
        // console.log("??????????????? ?????? ??????!!", this.id);
        // console.log(this.root.nodeRendertList);
      }
    }
    if (this.hasChild) {
      if (this.first) {
        // console.log("this.id:", this.first.id);
        // console.log("this.first.id:", this.first.id);
        // console.log("?????? ?????? ?????? ?????? ", this.first.id);
        this.first.renderListCheckOrder();
      }
      if (this.second) {
        // console.log("?????? ?????? ?????? ?????? ", this.second.id);
        // console.log("this.second.id:", this.second.id);
        this.second.renderListCheckOrder();
      }
    }
  }
}

const deleteFunctions = {
  replicaCase: (node: MosaicNode) => {
    const root = node.root;
    const origin = node.origin;
    //origin????????? node??? ?????? ??????
    const originNodeIsRootFirst = origin.id === root.first.id;
    //origin????????? node??? ?????? ??????
    const originNodeParentCase = node.parent.id === origin.id;
    //sibiling????????? ????????? ????????? ??????
    const sibilingHasChildCase = node.getSibilingNode().hasChild();
    const sibiling = node.getSibilingNode();

    if (originNodeIsRootFirst) {
      console.log("originNodeIsRootFirst");
      //???
      if (originNodeIsRootFirst && originNodeParentCase) {
        //origin????????? rootFirst??? ??????
        //targetNode??? ?????? ????????? origin??? ?????????
        //???
        if (
          sibilingHasChildCase &&
          originNodeIsRootFirst &&
          originNodeParentCase
        ) {
          console.log(
            "sibilingHasChildCase &&originNodeIsRootFirst && originNodeParentCase"
          );

          sibiling.parent = root;
          sibiling.location = "first";
          root.first = sibiling;
        }
        //???
        if (
          !sibilingHasChildCase &&
          originNodeIsRootFirst &&
          originNodeParentCase
        ) {
          console.log(
            "!sibilingHasChildCase && originNodeIsRootFirst && originNodeParentCase"
          );

          sibiling.parent = root;
          sibiling.location = "first";
          root.first = sibiling;
        }
        // console.log("originNodeParentCase");
        // sibiling.boundingBox = root.first.boundingBox;
        // sibiling.location = root.first.location;
        // root.first = sibiling;
        // sibiling.parent = root;
      }

      //???
      if (originNodeIsRootFirst && !originNodeParentCase) {
        console.log("originNodeIsRootFirst && !originNodeParentCase");
        //origin????????? rootFirst??? ??????
        //targetNode??? ?????? ????????? origin??? ??????.
        if (
          originNodeIsRootFirst &&
          !originNodeParentCase &&
          sibilingHasChildCase
        ) {
          //?????? ????????? ??????????????? ?????????
          //?????? ????????? ????????? ?????? ????????? ????????? ??????
          //????????? ?????? ????????? ?????? ????????? ?????? ??????
          console.log(
            "originNodeIsRootFirst && !originNodeParentCase &&sibilingHasChildCase"
          );
          const nextSibilingLocation = sibiling.parent.location;

          const parentParent = node.parent.parent;
          //???????????? ??????????????? ???????????? ??????.
          origin.originNodeUpdateOrder({
            nextOriginNode: sibiling,
            onlyDataOverwrite: true,
          });

          sibiling.originNodeUpdateOrder({
            nextOriginNode: origin,
          });

          parentParent[nextSibilingLocation] = sibiling;
          sibiling.parent = parentParent;
          sibiling.isReplica = true;
          sibiling.location = nextSibilingLocation;
          console.log(root);
        }
        if (
          originNodeIsRootFirst &&
          !originNodeParentCase &&
          !sibilingHasChildCase
        ) {
          //?????? ????????? ??????????????? ?????????
          //?????? ????????? ????????? ?????? ????????? ????????? ??????
          //????????? ?????? ????????? ?????? ????????? ?????? ??????
          console.log(
            `originNodeIsRootFirst &&!originNodeParentCase && !sibilingHasChildCase`
          );

          console.log(root);
          console.log(
            `????????? ??? ????????? ${origin.data} // ?????? ????????? ${sibiling.data}`
          );
          const nextSibilingLocation = sibiling.parent.location;

          const parentParent = node.parent.parent;
          origin.originNodeUpdateOrder({
            nextOriginNode: sibiling,
            onlyDataOverwrite: true,
          });
          sibiling.originNodeUpdateOrder({
            nextOriginNode: origin,
          });
          parentParent[nextSibilingLocation] = sibiling;
          sibiling.parent = parentParent;
          sibiling.isReplica = true;
          sibiling.location = nextSibilingLocation;
          console.log(root);
        }
      }
    }
    //???
    if (!originNodeIsRootFirst) {
      console.log();
      const originNodeParentCase = node.parent === origin;
      if (!originNodeIsRootFirst && originNodeParentCase) {
        if (
          !originNodeIsRootFirst &&
          originNodeParentCase &&
          sibilingHasChildCase
        ) {
          //??????
          console.log(
            "!originNodeIsRootFirst && originNodeParentCase &&sibilingHasChildCase"
          );
          sibiling.parent = node.parent.parent;
          node.parent.parent[node.parent.location] = sibiling;
          // const sibilingNonReplicaChildLocation =
          //   sibiling.findNonreplicaChildLocation();
          // const sibilingReplicaChildLocation =
          //   sibiling.findReplicaChildLocation();
          // const sibilingReplicaChild = sibiling.findReplicaChild();
          // const sibilingNonReplicaChild = sibiling.findNonReplicaChild();
          // origin.originNodeUpdateOrder({
          //   nextOriginNode: sibiling,
          //   onlyDataOverwrite: true,
          // });

          // sibiling.originNodeUpdateOrder({ nextOriginNode: origin });
          // sibilingNonReplicaChild.parent = origin;
          // sibilingReplicaChild.parent = origin;
          // origin[sibilingReplicaChildLocation] = sibilingReplicaChild;
          // origin[sibilingNonReplicaChildLocation] = sibilingNonReplicaChild;

          // sibiling.parent = node.parent.parent;
        }
        //???
        if (
          !originNodeIsRootFirst &&
          originNodeParentCase &&
          !sibilingHasChildCase
        ) {
          console.log(
            "!originNodeIsRootFirst &&originNodeParentCase && !sibilingHasChildCase"
          );
          const nextSibilingLocation = node.parent.location;
          sibiling.parent = node.parent.parent;
          node.parent.parent[nextSibilingLocation] = sibiling;
        }
      }
      //???
      if (!originNodeIsRootFirst && !originNodeParentCase) {
        //???
        if (!originNodeIsRootFirst && sibilingHasChildCase) {
          console.log(
            "!originNodeParentCase&&!originNodeIsRootFirst && sibilingHasChildCase"
          );
          //?????? ????????? ????????? ????????? ??????
          //?????? ????????? ??????????????? ?????? ??????
          //?????? ????????? ????????? ?????? ????????? ????????? ??????
          //????????? ?????? ????????? ?????? ????????? ?????? ??????
          origin.originNodeUpdateOrder({
            nextOriginNode: sibiling,
            onlyDataOverwrite: true,
          });
          sibiling.originNodeUpdateOrder({ nextOriginNode: origin });
          sibiling.isReplica = true;
          const nextSibilingLocation = node.parent.location;
          sibiling.location = nextSibilingLocation;
          node.parent.parent[nextSibilingLocation] = sibiling;
          sibiling.parent = node.parent.parent;
        }
        //???
        if (!originNodeIsRootFirst && !sibilingHasChildCase) {
          console.log(
            "!originNodeParentCase&&!originNodeIsRootFirst && !sibilingHasChildCase"
          );
          origin.originNodeUpdateOrder({
            nextOriginNode: sibiling,
            onlyDataOverwrite: true,
          });
          sibiling.originNodeUpdateOrder({ nextOriginNode: origin });
          sibiling.isReplica = true;
          const nextSibilingLocation = node.parent.location;
          sibiling.location = nextSibilingLocation;
          node.parent.parent[nextSibilingLocation] = sibiling;
          sibiling.parent = node.parent.parent;
        }
      }
    }
    root.resizingOrder();
    root.updateSplitPercentOrder();
    root.getSplitBarRenderList();
    console.log("end root", root);
  },
  nomalCase: (node: MosaicNode) => {
    const root = node.root;
    const parent = node.parent;
    const parentLocation = parent.location;
    const parentParent = parent.parent;
    const parentDirection = parent.direction;
    const parentBoundingBox = parent.boundingBox;
    const sibiling = node.getSibilingNode();
    const sibilingLocaiton = sibiling.location;
    const sibilingHasChild = sibiling.hasChild();
    if (node.isRootFirstNode && !node.hasChild) {
      root.resizingOrder();
      root.updateSplitPercentOrder();
      root.getSplitBarRenderList();
      return;
    }
    console.log("nomal case");
    if (node.parent.id === "master") {
      root.resizingOrder();
      root.updateSplitPercentOrder();
      root.getSplitBarRenderList();
      return;
    }
    if (!node.isReplica) {
      if (sibilingHasChild) {
        console.log("sibilingHasChild");
        //?????????
        sibiling.origin = sibiling;
        sibiling.type = "parent";
        sibiling.isReplica = false;
        sibiling.boundingBox = parentBoundingBox;
        sibiling.location = parentLocation;
        parentParent[parentLocation] = sibiling;
        sibiling.parent = parentParent;
        console.log(root);
      }
      if (!sibilingHasChild) {
        const parentNode = node.parent;
        const parentReplicaNode =
          parentNode[node.location === "first" ? "second" : "first"];
        if (parentReplicaNode.type === "parent") {
          const tempFirst = parentReplicaNode.first;
          const tempSecond = parentReplicaNode.second;
          tempFirst.parent = parentNode;
          tempSecond.parent = parentNode;
        }
        if (parentReplicaNode.type === "child") {
          parentNode.type = "child";
          parentNode.first = null;
          parentNode.second = null;
        }
      }
    }
    root.resizingOrder();
    root.updateSplitPercentOrder();
    root.getSplitBarRenderList();
  },
};
const findOriginLocation = (originId: string, node: MosaicNode) => {
  let originNode = node;
  let manyUp = 0;
  while (
    originNode?.parent?.id === originId ||
    originNode?.parent?.origin.id === originId
  ) {
    console.log("nextNode", originNode.parent);
    originNode = originNode.parent;
  }
  const isFirst = originNode.parent?.first?.id === originId;
  const isSecond = originNode.parent?.second?.id === originId;
  return { manyUp, originNode, isFirst, isSecond };
};

export interface Split {
  first: BoundingBox;
  second: BoundingBox;
}

type BoundingBox = { top: number; bottom: number; left: number; right: number };
