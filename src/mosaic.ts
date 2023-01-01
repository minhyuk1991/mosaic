import { v4 as uuidv4 } from "uuid";

let data = -1;
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
    return this.first || this.second ? true : false;
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
    console.log("before", this.boundingBox);
    console.log("parent id", this.parent?.id);
    console.log("parent", this.parent?.boundingBox);
    console.log("after", this.getBoundingBox());
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
  nodeRenderListCheckOrder() {
    // console.log("nodeRenderListCheckOrder실행");
    // console.log("현재 실행중인 노드 ", this.id);

    if (this.id !== "master") {
      if (this.type === "child") {
        this.root.nodeRendertList.set(this.origin.id, this);
        // console.log("랜더리스트 추가 완료!!", this.id);
        console.log(this.root.nodeRendertList);
      }
    }
    if (this.hasChild) {
      if (this.first) {
        // console.log("다음 실행 예정 노드 ", this.first.id);
        this.first.nodeRenderListCheckOrder();
      }
      if (this.second) {
        // console.log("다음 실행 예정 노드 ", this.second.id);
        this.second.nodeRenderListCheckOrder();
      }
    }
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

  // changeOriginDataOrder(tobeNode: MosaicNode) {
  //   this.data = tobeNode.data;
  //   if (this.hasChild) {
  //     if (this.first && this.first.isReplica) {
  //       this.first.changeOriginDataOrder(tobeNode);
  //     }
  //     if (this.first && this.first.isReplica) {
  //       this.second.changeOriginDataOrder(tobeNode);
  //     }
  //   }
  // }
  // changeOriginInfo(tobeNode: MosaicNode) {
  //   if (this.isReplica) {
  //     throw new Error("This method is dedicated to the source node.");
  //   }
  //   console.log("인자 전달받은 아이디", tobeNode.id);
  //   if (!this.isReplica) {
  //     this.changeOriginDataOrder(tobeNode);
  //   }
  // }

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
  findNonReplicaChild() {
    return this.origin.id === this.first.origin.id ? this.second : this.first;
  }

  findReflicaChildLocation(): null | "first" | "second" {
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

  findNonReflicaChildLocation(): null | "first" | "second" {
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
  originNodeUpdate(nextOriginNode: MosaicNode) {
    if (this.id === this.origin.id) {
      this.originNodeUpdateOrder(nextOriginNode);
    } else {
      console.log("this node not origin");
    }
  }

  originNodeUpdateOrder(nextOriginNode: MosaicNode) {
    console.log(" originNodeUpdateOrder 실행");

    const beforeOriginId = this.origin.id;
    this.origin = nextOriginNode;
    if (this.hasChild()) {
      if (this.first.origin.id === beforeOriginId) {
        console.log("첫번째 자식 오리진 체인지 실행");
        this.first.originNodeUpdateOrder(nextOriginNode);
      }
      if (this.second.origin.id === beforeOriginId) {
        console.log("두번째 자식 오리진 체인지 실행");
        this.second.originNodeUpdateOrder(nextOriginNode);
      }
    }
  }
}

const deleteFunctions = {
  reflicaCase: (node: MosaicNode) => {
    const origin = node.origin;
    const originBoundingBox = origin.boundingBox;
    const originDirection = origin.direction;
    const originParent = origin.parent;
    const root = node.root;
    const originLocation = origin.location;
    const originReflicaChildLocation = origin.findReflicaChildLocation();
    const originNonReflicaChildLocation = origin.findNonReflicaChildLocation();
    const originReflicaChild = origin[originReflicaChildLocation];
    const originNonReflicaChild = origin[originNonReflicaChildLocation];
    const originReflicaChildDirection = originReflicaChild.direction;
    const originNonReflicaChildDirection = originNonReflicaChild.direction;
    const originNodeIsRootFirst = origin.id === root.first.id;
    const sibiling = node.getSibilingNode();
    const sibilingOrigin = sibiling.origin;
    const sibilingOriginLocation = sibilingOrigin.location;
    const sibilingOriginSibilingLocation =
      sibilingOrigin.getSibilingNode().location;
    const parentLocation = node.parent.location;
    if (originNodeIsRootFirst) {
      console.log("originNodeIsRootFirst");
      const nodeIsOriginChild = origin.hasChildNode(node.id).has;

      console.log("nodeIsOriginChild", nodeIsOriginChild);
      if (nodeIsOriginChild) {
        console.log("nodeIsOriginChild");
        root.first = node.getSibilingNode();
        root.first.parent = root;
      }
      if (!nodeIsOriginChild) {
      }
    }
    if (!originNodeIsRootFirst) {
      const nextOriginNode = new MosaicNode(
        sibilingOrigin,
        sibilingOriginLocation,
        true
      );
      //다음 원본 노드 속성변경

      nextOriginNode.origin = nextOriginNode;
      nextOriginNode.type = "parent";
      nextOriginNode.isReplica = false;
      nextOriginNode.parent = originParent;
      nextOriginNode.boundingBox = originBoundingBox;
      nextOriginNode.direction = originDirection;

      //원본의 부모에 원본의 위치에 다음 원보노드 할당
      originParent[originLocation] = nextOriginNode;
      console.log("originLacaton:", originLocation);
      console.log(
        "originLacaton:",
        originParent[originLocation] === nextOriginNode
      );
      //다음 원본노드의 부모를 원본 부모로 할당

      //원본
      sibilingOrigin.originNodeUpdate(nextOriginNode);
      sibilingOrigin.isReplica = true;
      sibilingOrigin.parent = nextOriginNode;
      sibilingOrigin.location = parentLocation;
      originNonReflicaChild.parent = nextOriginNode;
      nextOriginNode[originReflicaChildLocation] = sibilingOrigin;
      nextOriginNode[originNonReflicaChildLocation] = originNonReflicaChild;
      // nextOriginNode[originReflicaChildLocation].direction =
      //   originReflicaChildDirection;
      // nextOriginNode[originNonReflicaChildLocation].direction =
      //   originNonReflicaChildDirection;
    }
    root.resizingOrder();
    root.updateSplitPercentOrder();
    root.getSplitBarRenderList();
    console.log("root", root.nodeRendertList);
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
      return;
    }
    console.log("nomal case");
    if (node.parent.id === "master") return;
    if (!node.isReplica) {
      if (sibilingHasChild) {
        console.log("sibilingHasChild");
        //작업중
        sibiling.origin = sibiling;
        sibiling.type = "parent";
        sibiling.originNodeUpdate(sibiling);
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
