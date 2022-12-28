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
    this.direction = getdirection(parent);
    this.boundingBox = getBoundingBox(
      this.parent,
      parent ? parent.direction : "row",
      this.splitPercent,
      this.location
    );
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
    const isFirst = this.parent.first.id === this.id;
    return this.parent[isFirst ? "second" : "first"];
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
    this.boundingBox = getBoundingBox(
      this.parent,
      this.direction,
      this.splitPercent,
      this.location
    );
    console.log("updateSplitPercentOrder");
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
      this.second = new MosaicNode(this, "second");
      this.type = "parent";
      this.root.splitBarRenderList.set(this.id, this);
      this.root.getSplitBarRenderList();
    }
    console.log(this.root);
  }
  delete() {
    if (this.id === "master") return;
    if (!this.isReplica) deleteFunctions.nomalCase(this);
    if (this.isReplica) deleteFunctions.reflicaCase(this);
  }

  insert(insertNode: MosaicNode, order: "first" | "second") {
    const { originNode } = findOriginLocation(this.origin.id, this);
    // const tempFirst = originNode.first;
    // const tempSecond = originNode.second;
    insertNode.parent = originNode.parent;
    insertNode.location = order;
    // insertNode.first = tempFirst;
    // insertNode.second = tempSecond;
    originNode.parent[order] = insertNode;
    insertNode.type = "parent";
    insertNode[order] = new MosaicNode(this, order, true);
    insertNode[order === "first" ? "second" : "first"] = originNode;
    originNode.parent = insertNode;
    originNode.location = order === "first" ? "second" : "first";
  }
}
const deleteFunctions = {
  reflicaCase: (node: MosaicNode) => {
    console.log("reflicaCase");
    //복제된 노드라면, 원본 노드를 찾음 (originNode)
    const { manyUp, originNode, isFirst, isSecond } = findOriginLocation(
      node.origin.id,
      node
    );
    const nextOriginNode =
      node.parent.first?.id === node.id
        ? node.parent.first
        : node.parent.second;
    node.parent.first = null;
    node.parent.second = null;
    console.log("덮어쓸 노드아이디", nextOriginNode.id);
    originNode.changeOriginInfo(nextOriginNode);
    node.parent.type = "child";
    console.log(node.root);
  },
  nomalCase: (node: MosaicNode) => {
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

function getBoundingBox(
  parent: MosaicNode,
  direction,
  splitPercent: number,
  location: "first" | "second"
) {
  console.log("getBoundingBox 동작");
  if (parent === null) {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  if (parent.id === "master") {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
  if (parent.parent.id === "master") {
    if (direction === "column" && location === "first") {
      return {
        ...parent.boundingBox,
        bottom: 100 - splitPercent,
      };
    }
    if (direction === "column" && location === "second") {
      return {
        ...parent.boundingBox,
        top: 100 - splitPercent,
      };
    }
    if (direction === "row" && location === "first") {
      return {
        ...parent.boundingBox,
        right: 100 - splitPercent,
      };
    }
    if (direction === "row" && location === "second") {
      return {
        ...parent.boundingBox,
        left: 100 - splitPercent,
      };
    }
  }
  if (parent.id !== "master") {
    const result = split(
      parent.boundingBox,
      parent.splitPercent,
      parent.direction
    );
    return result[location];
  }
}

export interface Split {
  first: BoundingBox;
  second: BoundingBox;
}
// export interface Styles {
//   top: string;
//   right: string;
//   bottom: string;
//   left: string;
// }
type BoundingBox = { top: number; bottom: number; left: number; right: number };
export function split(
  boundingBox: BoundingBox,
  relativeSplitPercentage: number,
  direction: "row" | "column"
) {
  console.log("absolutePercentage11");

  const absolutePercentage = getAbsoluteSplitPercentage(
    boundingBox,
    relativeSplitPercentage,
    direction
  );
  if (direction === "column") {
    return {
      first: {
        ...boundingBox,
        bottom: 100 - absolutePercentage,
      },
      second: {
        ...boundingBox,
        top: absolutePercentage,
      },
    };
  } else if (direction === "row") {
    return {
      first: {
        ...boundingBox,
        right: 100 - absolutePercentage,
      },
      second: {
        ...boundingBox,
        left: absolutePercentage,
      },
    };
  } else {
    return assertNever(direction);
  }
}

function getSize(node: MosaicNode, order: "first" | "second") {
  const fullSizeCase =
    !this.getIsSameNode(this.root.first) && !this.getIsSameNode(this.root);
  if (fullSizeCase) {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };
  }

  const { top, bottom, left, right } = node.parent.boundingBox;
  const parentWidth = 100 - left - right;
  const parentHeigth = 100 - top - bottom;

  if (node.direction === "column") {
  }
}

export function getAbsoluteSplitPercentage(
  boundingBox: BoundingBox | null = null,
  relativeSplitPercentage: number,
  direction: "row" | "column"
): number {
  const { top, right, bottom, left } = boundingBox || {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
  if (direction === "column") {
    const height = 100 - top - bottom;
    return (height * relativeSplitPercentage) / 100 + top;
  } else if (direction === "row") {
    const width = 100 - right - left;
    return (width * relativeSplitPercentage) / 100 + left;
  } else {
    return assertNever(direction);
  }
}

export function getRelativeSplitPercentage(
  boundingBox: BoundingBox,
  absoluteSplitPercentage: number,
  direction: "row" | "column"
): number {
  const { top, right, bottom, left } = boundingBox;
  if (direction === "column") {
    const height = 100 - top - bottom;
    return ((absoluteSplitPercentage - top) / height) * 100;
  } else if (direction === "row") {
    const width = 100 - right - left;
    return ((absoluteSplitPercentage - left) / width) * 100;
  } else {
    return assertNever(direction);
  }
}

export function asStyles({ top, right, bottom, left }: BoundingBox) {
  return {
    top: `${top}%`,
    right: `${right}%`,
    bottom: `${bottom}%`,
    left: `${left}%`,
  };
}
export function assertNever(shouldBeNever: never): never {
  throw new Error("Unhandled case: " + JSON.stringify(shouldBeNever));
}

function getdirection(parent: MosaicNode) {
  console.log("getdirection");
  if (!parent) return "row";
  if (parent && parent.id === "master") {
    return "row";
  }
  const result = parent.direction === "row" ? "column" : "row";

  return result;
}
