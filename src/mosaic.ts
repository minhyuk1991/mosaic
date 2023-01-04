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
    this.root.nodeRendertList.set(item.origin.id, item);
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
      this.root.splitBarRenderList.set(this.origin.id, this);
      this.root.getSplitBarRenderList();
      console.log("====split 완료===", this);
    }
    console.log(this.root);
  }
  delete() {
    if (this.id === "master") throw new Error("this node is master node");
    if (this.parent.id === "master")
      throw new Error("this node parent is master node");
    if (!this.isReplica) deleteFunctions.nomalCase(this);
    if (this.isReplica) deleteFunctions.replicaCase(this);
  }
  insert(
    insertNode: MosaicNode,
    location: "first" | "second",
    direction: "row" | "column"
  ) {
    const replicaLocation = location === "first" ? "second" : "first";
    const insertLocation = location;
    console.log(
      `==========insert===========${(insertNode.id, location, direction)}`
    );
    this.type = "parent";
    insertNode.parent = this;
    insertNode.type = "child";
    insertNode.location = location;
    this.direction = direction;
    console.log(insertNode);
    this[replicaLocation] = new MosaicNode(this, replicaLocation, true);
    this[insertLocation] = insertNode;
    insertNode.boundingBox = insertNode.getBoundingBox();

    console.log("insertNode.id", insertNode.id);
    console.log("insertNode", insertNode);
    console.log("insertNode.parent", insertNode.parent.id === this.id);
    this.root.nodeRendertList.clear();
    this.root.splitBarRenderList.clear();
    this.root.getRenderList();
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
  findNonReplicaChild() {
    return this.origin.id === this.first.origin.id ? this.second : this.first;
  }
  findreplicaChildLocation(): null | "first" | "second" {
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
  //현재노드를 오리진으로 만들고,
  // changeToBeOrigin(nodeId:string){
  //   this.origin =
  //   this.id=
  // }
  // originNodeUpdateOrder(nextOriginNode: MosaicNode) {

  //   if (this.id === this.origin.id) {
  //     this.originNodeUpdateOrder(nextOriginNode);
  //   } else {
  //     console.log("this node not origin");
  //   }
  // }
  //오리진 노드가 변한다는 것은 무엇인가?????

  //origin
  //type
  //id
  //splitPercent
  //location
  //isReplica
  //direction
  //data

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
  modifyingToDataOnReceivedNodeOrder(node: MosaicNode) {
    const beforeOriginId = this.id;
    this.data = node.data;
    this.id = node.id;
    this.changereplicaChild(this, beforeOriginId);
  }
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
        console.log("첫번째 자식 오리진 체인지 실행");
        this.first.originNodeUpdateOrder({ nextOriginNode });
      }
      if (
        this.second.origin.id === CustomBeforeOriginId
          ? CustomBeforeOriginId
          : beforeOriginId
      ) {
        console.log("두번째 자식 오리진 체인지 실행");
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
    dataOverwrite = false,
  }: {
    nextOriginNode: MosaicNode;
    dataOverwrite?: boolean;
  }) {
    console.log(" originNodeUpdateOrder 실행");
    const beforeOriginId = this.origin.id;
    let node;
    if (dataOverwrite) {
      this.data = nextOriginNode.data;
      node = this;
    }
    if (!dataOverwrite) {
      this.origin = nextOriginNode;
      node = nextOriginNode;
    }
    if (this.hasChild()) {
      if (this.first.origin.id === beforeOriginId) {
        console.log("첫번째 자식 오리진 체인지 실행");
        this.first.originNodeUpdateOrder({ nextOriginNode: node });
      }
      if (this.second.origin.id === beforeOriginId) {
        console.log("두번째 자식 오리진 체인지 실행");
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

  splitBarListCheckOrder() {
    const renderTarget = !this.isSameNode(this.root) && this.type === "parent";
    if (renderTarget) {
      this.root.splitBarRenderList.set(this.origin.id, this);
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
  renderListCheckOrder() {
    // console.log("renderListCheckOrder실행");
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
        this.first.renderListCheckOrder();
      }
      if (this.second) {
        // console.log("다음 실행 예정 노드 ", this.second.id);
        this.second.renderListCheckOrder();
      }
    }
  }
}

const deleteFunctions = {
  replicaCase: (node: MosaicNode) => {
    const root = node.root;
    const origin = node.origin;
    //origin노드가 node의 직계 부모
    const originNodeIsRootFirst = origin.id === root.first.id;
    //origin노드가 node의 직계 부모
    const originNodeParentCase = node.parent === origin;
    //sibiling노드가 자식을 가지고 있음
    const sibilingHasChildCase = node.getSibilingNode().hasChild();
    const sibiling = node.getSibilingNode();

    if (originNodeIsRootFirst) {
      console.log("originNodeIsRootFirst");
      if (originNodeIsRootFirst && originNodeParentCase) {
        //origin노드가 rootFirst의 자식
        //targetNode의 부모 노드가 origin인 케이스
        console.log("originNodeParentCase");
        sibiling.boundingBox = root.first.boundingBox;
        sibiling.location = root.first.location;
        root.first = sibiling;
        sibiling.parent = root;
        sibiling.type = "parent";
      }
      if (originNodeIsRootFirst && !originNodeParentCase) {
        console.log("originNodeIsRootFirst && !originNodeParentCase");
        //origin노드가 rootFirst의 자식
        //targetNode의 부모 노드가 origin이 아님.
        if (
          originNodeIsRootFirst &&
          !originNodeParentCase &&
          sibilingHasChildCase
        ) {
          //원본 노드가 루트노드의 자식임
          //원본 노드가 딜리트 누른 노드의 부모가 아님
          //딜리트 누른 노드의 형제 노드가 자식 있음
          console.log(
            " originNodeIsRootFirst && !originNodeParentCase &&sibilingHasChildCase"
          );

          origin.originNodeUpdateOrder({
            nextOriginNode: sibiling,
            dataOverwrite: true,
          });

          sibiling.originNodeUpdateOrder({
            nextOriginNode: root.first,
          });

          const nextSibilingLocation = sibiling.parent.location;
          sibiling.parent.parent[nextSibilingLocation] = sibiling;
          sibiling.parent = sibiling.parent.parent;
          sibiling.isReplica = true;
          sibiling.location = nextSibilingLocation;
          console.log(root);
        }
        if (
          originNodeIsRootFirst &&
          !originNodeParentCase &&
          !sibilingHasChildCase
        ) {
          //원본 노드가 루트노드의 자식임
          //원본 노드가 딜리트 누른 노드의 부모가 아님
          //딜리트 누른 노드의 형제 노드가 자식 없음
          console.log(
            `originNodeIsRootFirst &&!originNodeParentCase && !sibilingHasChildCase`
          );

          origin.originNodeUpdateOrder({
            nextOriginNode: sibiling,
            dataOverwrite: true,
          });
          origin.origin = origin;

          node.parent.deleteFirstAndSecond();
          console.log("root", node.parent);
        }
      }
    }
    if (!originNodeIsRootFirst) {
      console.log();
      const originNodeParentCase = node.parent === origin;
      if (!originNodeIsRootFirst && originNodeParentCase) {
        if (
          !originNodeIsRootFirst &&
          originNodeParentCase &&
          sibilingHasChildCase
        ) {
          console.log(
            "!originNodeIsRootFirst && originNodeParentCase &&sibilingHasChildCase"
          );
          const nextSibilingLocation = node.parent.location;

          sibiling.location = nextSibilingLocation;
          sibiling.parent = node.parent.parent;
          node.parent.parent[nextSibilingLocation] = sibiling;
        }
        if (
          !originNodeIsRootFirst &&
          originNodeParentCase &&
          !sibilingHasChildCase
        ) {
          console.log(
            "!originNodeIsRootFirst &&originNodeParentCase && !sibilingHasChildCase"
          );
          sibiling.parent = node.parent.parent;
          const nextSibilingLocation = node.parent.location;
          node.parent.parent[nextSibilingLocation] = sibiling;
        }
      }
      if (!originNodeIsRootFirst && !originNodeParentCase) {
        if (!originNodeIsRootFirst && sibilingHasChildCase) {
          console.log(
            "!originNodeParentCase&&!originNodeIsRootFirst && sibilingHasChildCase"
          );
          //원본 노드가 루트의 자식이 아님
          //원본 노드가 루트노드의 자식 아님
          //원본 노드가 딜리트 누른 노드의 부모가 아님
          //딜리트 누른 노드의 형제 노드가 자식 있음
          origin.originNodeUpdateOrder({
            nextOriginNode: sibiling,
            dataOverwrite: true,
          });
          sibiling.originNodeUpdateOrder({ nextOriginNode: origin });
          sibiling.isReplica = true;
          const nextSibilingLocation = node.parent.location;
          sibiling.location = nextSibilingLocation;
          node.parent.parent[nextSibilingLocation] = sibiling;
          sibiling.parent = node.parent.parent;
        }
        if (!originNodeIsRootFirst && !sibilingHasChildCase) {
          console.log(
            "!originNodeParentCase&&!originNodeIsRootFirst && !sibilingHasChildCase"
          );
          origin.originNodeUpdateOrder({
            nextOriginNode: sibiling,
            dataOverwrite: true,
          });
          node.parent.deleteFirstAndSecond();
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
