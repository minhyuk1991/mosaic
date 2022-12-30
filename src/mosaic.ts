import { v4 as uuidv4 } from "uuid";

export class MosaicNode {
  nodeRendertList: Map<string, MosaicNode> = null;
  splitBarRenderList: Map<string, MosaicNode>;
  root: MosaicNode | null = null;
  parent: MosaicNode | null = null;
  first: MosaicNode | null = null;
  second: MosaicNode | null = null;
  origin: MosaicNode;
  type: "parent" | "child";
  id: string;
  splitPercent: number;
  isReplica: boolean;
  location: "first" | "second";
  direction: "row" | "column";
  boundingBox: { top: number; bottom: number; left: number; right: number };
  constructor(
    parent?: MosaicNode,
    location?: "first" | "second",
    replicaOption: boolean = false
  ) {
    this.root = parent ? parent.root : this;
    this.parent = parent ? parent : null;
    this.first = null;
    this.second = null;
    this.origin = replicaOption && parent ? parent.origin : this;
    this.id = parent ? uuidv4() : "master";
    this.type = parent ? "child" : "parent";
    this.splitPercent = this.id === "master" ? 100 : 50;
    this.isReplica = replicaOption ? true : false;
    this.nodeRendertList = parent ? parent.nodeRendertList : new Map();
    this.splitBarRenderList = parent ? parent.splitBarRenderList : new Map();
    this.location = location ? location : "first";
    this.direction = this.getParentDirection();
    this.boundingBox = this.getBoundingBox();
    console.log(this.direction);
  }
  init() {
    console.log(this);
    const item = new MosaicNode(this);
    this.root.type = "parent";
    this.first = item;
    item.parent = this.root;
    this.root.nodeRendertList.set(item.origin.id, item);
    return this;
  }

  getLocation() {
    console.log("getLocation");
    const isFirst = this.parent.first.id === this.id;
    const isSecond = this.parent.second.id === this.id;
    if (isFirst || isSecond) {
      console.log(isFirst ? "first" : "aa");
      if (isFirst) return "first";
      if (isSecond) return "second";
    } else {
      throw new Error("not found this id");
    }
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

  getReflica() {
    return this.origin.id === this.id ? false : true;
  }
  hasChild() {
    return this.first || this.second;
  }

  getIsSameNode(node: MosaicNode) {
    return node.id === this.id;
  }
  getNodeRenderList() {
    this.root.nodeRendertList.clear();
    this.root.nodeRenderListCheckOrder();
  }

  getSplitBarRenderList() {
    this.root.splitBarRenderList.clear();
    this.root.splitBarListCheckOrder();
  }
  splitBarListCheckOrder() {
    const renderTarget =
      !this.getIsSameNode(this.root) && this.type === "parent";
    if (renderTarget) {
      this.root.splitBarRenderList.set(this.id, this);
    }
    if (this.hasChild) {
      if (this.first) {
        this.first.splitBarListCheckOrder();
      }
      if (this.second) {
        this.second.splitBarListCheckOrder();
      }
    }
  }
  updateSplitPercentOrder() {
    this.boundingBox = this.getBoundingBox();
    if (this.hasChild()) {
      if (this.first) {
        this.first.nodeRenderListCheckOrder();
      }
      if (this.second) {
        this.second.nodeRenderListCheckOrder();
      }
    }
  }
  nodeRenderListCheckOrder() {
    const renderTarget =
      !this.getIsSameNode(this.root) && this.type === "child";
    if (renderTarget) {
      this.root.nodeRendertList.set(this.origin.id, this);
    }
    if (this.hasChild) {
      if (this.first) {
        this.first.nodeRenderListCheckOrder();
      }
      if (this.second) {
        this.second.nodeRenderListCheckOrder();
      }
    }
  }

  changeOriginInfo(node: MosaicNode) {
    console.log("인자 전달받은 아이디", node.id);
    if (!this.isReplica) {
      console.log("바뀌기 전 아이디", this.id);
      const prevReplicaOriginId = this.id;
      this.id = node.id;
      // this.type = node.type;
      this.splitPercent = node.splitPercent;
      this.isReplica = node.isReplica;
      if (this.first && this.second) {
        const target =
          this.first.origin.id === prevReplicaOriginId
            ? this.first
            : this.second;
        this.originInfoChangePropagationToChild(this, prevReplicaOriginId);
      }
    }
  }

  //받은 노드로부터 아래 자식 노드들의 origin 정보를 바꿈.
  originInfoChangePropagationToChild(
    originNode: MosaicNode,
    prevReplicaOriginId: string
  ) {
    if (this.isReplica) {
      this.origin = originNode;
      if (this.first && this.second) {
        const nextTarget =
          this.first.origin.id === prevReplicaOriginId
            ? this.first
            : this.second;
        nextTarget.originInfoChangePropagationToChild(
          originNode,
          prevReplicaOriginId
        );
      }
      if (!this.first && !this.second) {
        this.type = "child";
      }
    }
  }
  split() {
    const isNoChild = !this.first && !this.second;
    //parent 없을 시 master node /childNode 있을 시
    if (!this.parent || !isNoChild) return;
    //childNode 없다면
    if (isNoChild) {
      //새로운 노드 생성, first는 항상 replica
      this.first = new MosaicNode(this, "first", true);
      console.log(this.first.boundingBox);
      this.second = new MosaicNode(this, "second");
      this.type = "parent";
      this.root.splitBarRenderList.set(this.id, this);
      this.root.getSplitBarRenderList();
      console.log("====split 완료===", this);
    }
    console.log(this.root);
  }
  delete() {
    if (this.id === "master") return;
    if (!this.isReplica) deleteFunctions.nomalCase(this);
    if (this.isReplica) deleteFunctions.reflicaCase(this);
  }

  getParentDirection() {
    const parent = this.parent;
    if (!parent) return "row";
    if (parent && parent.id === "master") {
      return "row";
    }
    const result = parent.direction === "row" ? "column" : "row";

    return result;
  }

  resizingOrder() {
    this.boundingBox = this.getBoundingBox();
    console.log("resizingOrder", this.id);
    if (this.first) {
      this.first.resizingOrder();
    }
    if (this.second) {
      this.second.resizingOrder();
    }
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
        return {
          ...this.parent.boundingBox,
          right: right + parentWidth * (100 - parentSplitPercent) * 0.01,
        };
      }
      if (rowAndSecondCase) {
        return {
          ...this.parent.boundingBox,
          left: left + parentWidth * parentSplitPercent * 0.01,
        };
      }

      if (columnAndFirstCase) {
        return {
          ...this.parent.boundingBox,
          bottom: bottom + parentHeight * (100 - parentSplitPercent) * 0.01,
        };
      }
      if (columnAndSecondCase) {
        return {
          ...this.parent.boundingBox,
          top: top + parentHeight * parentSplitPercent * 0.01,
        };
      }
    }
  }
  insert(insertNode: MosaicNode, order: "first" | "second") {
    const { originNode } = findOriginLocation(this.origin.id, this);
    insertNode.parent = originNode.parent;
    insertNode.location = order;
    originNode.parent[order] = insertNode;
    insertNode.type = "parent";
    insertNode[order] = new MosaicNode(this, order, true);
    insertNode[order === "first" ? "second" : "first"] = originNode;
    originNode.parent = insertNode;
    originNode.location = order === "first" ? "second" : "first";
  }
  parentLinkClear() {
    this.parent.first = null;
    this.parent.second = null;
  }
  isRootFirstNode() {
    console.log("isRootFirstNode");
    return this.root.first.id === this.id;
  }
  hasChildNode(id) {
    if (this.first.id === id) {
      return { has: true, node: this.first, location: "first" };
    }
    if (this.first.id === id) {
      return { has: true, node: this.first, location: "second" };
    }
    return { has: false, node: null, location: null };
  }
}

const deleteFunctions = {
  reflicaCase: (node: MosaicNode) => {
    const rootNode = node.root;
    console.log("reflicaCase");

    //복제된 노드라면, 원본 노드를 찾음 (originNode)

    //
    node.parentLinkClear();
    if (node.origin.isRootFirstNode()) {
      //다음 루트 퍼스트
      const tempNextRootFirstNode = node.getSibilingNode();
      console.log(node.origin);
      console.log(rootNode);
      const nextRootFirstSecondLocation =
        node.origin.first.origin.id === node.origin.id ? "second" : "first";
      const nextRootFirstSecondNode = node.origin[nextRootFirstSecondLocation];

      console.log("isRootFirstNode");
      //루트퍼스트 -루트노드 연결
      rootNode.first = tempNextRootFirstNode;
      tempNextRootFirstNode.parent = rootNode;
      tempNextRootFirstNode.boundingBox = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };
      tempNextRootFirstNode.type = "parent";
      tempNextRootFirstNode.first = new MosaicNode(tempNextRootFirstNode);
      tempNextRootFirstNode.second = nextRootFirstSecondNode;
      rootNode.getNodeRenderList();
      rootNode.resizingOrder();
      console.log(rootNode);
    }

    // if (!originNode.isRootFirstNode()) {
    // }
    // node.parent.first = nextOriginNode;
    // nextOriginNode.type = "parent";
    // nextOriginNode.parent = node.parent;
    // nextOriginNode.first = new MosaicNode(nextOriginNode);
    // nextOriginNode.second = node.parent.second;
    // console.log(node.parent);
    // node.parent.second.parent = node.parent;

    // if (node.isRootFirstNode()) {
    //   node.root.first = nextOriginNode;
    // }
  },
  nomalCase: (node: MosaicNode) => {
    if (node.isRootFirstNode && !node.hasChild) {
      return;
    }
    console.log("nomal case");
    if (node.parent.id === "master") return;
    if (!node.isReplica) {
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
