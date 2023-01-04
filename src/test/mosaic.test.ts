import { MosaicNode } from "../mosaic";

const test = new MosaicNode().init();

describe("mosaicNode test ", () => {
  it("mosaic 최초 생성 id", () => {
    expect(new MosaicNode().init().id).toBe("master");
  });
  it("mosaic init", () => {
    expect(new MosaicNode().init().first).toBeTruthy();
    expect(new MosaicNode().init().second).toBe(null);
  });
});

describe("mosaicNode split test", () => {
  it("split", () => {
    const test = new MosaicNode().init();
    test.first.split();
    expect(test.first.second).toBeTruthy();
    expect(test.first.first).toBeTruthy();
  });

  it("split된 부모 자식 아이디 비교", () => {
    const test = new MosaicNode().init();
    test.first.split();
    expect(test.first.first.parent === test.first).toBe(true);
    expect(test.first.second.parent === test.first).toBe(true);
  });

  it("split origin 유효성 테스트", () => {
    const test = new MosaicNode().init();
    test.first.split();
    const origin = test.first;
    const replica = test.first.first;
    expect(origin).toEqual(replica.origin);
    expect(origin.id).toEqual(replica.origin.id);
  });
  it("split origin 유효성 테스트 2depth", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.first.split();
    const origin = test.first;
    const replica = test.first.first.first;
    expect(origin).toEqual(replica.origin);
    expect(origin.id).toEqual(replica.origin.id);
  });
  it("split origin 유효성 테스트 3depth", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.first.split();
    test.first.first.first.split();
    const origin = test.first;
    const replica = test.first.first.first.first;
    expect(origin).toEqual(replica.origin);
    expect(origin.id).toEqual(replica.origin.id);
  });

  it("split direction 유효성 테스트1", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.first.split();
    const parentNodeDirection = test.first.direction;
    const nextDirection = parentNodeDirection === "column" ? "row" : "column";
    expect(test.first.first.direction).toBe(nextDirection);
  });

  it("split direction 유효성 테스트2", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.first.split();
    const parentNodeDirection = test.first.first.direction;
    const nextDirection = parentNodeDirection === "column" ? "row" : "column";
    expect(test.first.first.first.direction).toBe(nextDirection);
  });

  it("split direction 유효성 테스트3", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.first.split();
    test.first.first.first.split();
    const parentNodeDirection = test.first.first.first.direction;
    const nextDirection = parentNodeDirection === "column" ? "row" : "column";
    expect(test.first.first.first.first.direction).toBe(nextDirection);
  });

  it("split 완료후 this는 parent가 됨1", () => {
    const test = new MosaicNode().init();
    expect(test.first.type).toBe("child");
    test.first.split();
    expect(test.first.type).toBe("parent");
  });

  it("split 완료후 this는 parent가 됨2", () => {
    const test = new MosaicNode().init();
    test.first.split();
    expect(test.first.first.type).toBe("child");
    test.first.first.split();
    expect(test.first.first.type).toBe("parent");
    expect(test.first.second.type).toBe("child");
    test.first.second.split();
    expect(test.first.second.type).toBe("parent");
  });

  it("split root의 splitBarRenderList", () => {
    const test = new MosaicNode().init();
    test.first.split();
    expect(test.first.first.type).toBe("child");
    test.first.first.split();
    expect(test.first.first.type).toBe("parent");
    expect(test.first.second.type).toBe("child");
    test.first.second.split();
    expect(test.first.second.type).toBe("parent");
  });
});

describe("delete test", () => {
  it("error case (master)", () => {
    try {
      const test = new MosaicNode().init();
      expect(test.delete()).toThrow();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("this node is master node");
    }
  });
  it("error case (root first)", () => {
    try {
      const test = new MosaicNode().init();
      expect(test.first.delete()).toThrow();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("this node parent is master node");
    }
  });

  it("delete depth1-replica", () => {
    const test = new MosaicNode().init();
    test.first.split();
    const first = test.first.first;
    const second = test.first.second;
    const secondId = second.id;

    first.delete();
    expect(test.first.id).toEqual(secondId);
    expect(test.first.first).toBe(null);
    expect(test.first.second).toBe(null);
  });

  it("delete depth1-replica", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.first.split();
    test.first.first.second.split();
    test.first.first.second.first.split();
    const nextFirstFirst = test.first.first.second;
    test.first.first.first.delete();
    expect(test.first.first.id).toBe(nextFirstFirst.id);
    expect(test.first.parent.id).toBe("master");
  });

  it("delete originNodeIsRootFirst && originNodeParentCase", () => {
    const test = new MosaicNode().init();
    test.first.split();
    const nextFirstId = test.first.second.id;
    test.first.first.delete();
    expect(test.first.id).toBe(nextFirstId);
    expect(test.first.boundingBox).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
    expect(test.first.parent.id).toBe("master");
    expect(test.first.first === null).toBe(true);
    expect(test.first.second === null).toBe(true);
  });
  it("originNodeIsRootFirst && originNodeParentCase && !sibilingHasChildCase", () => {
    const test = new MosaicNode().init();
    test.first.split();
    const secondId = test.first.second.id;
    test.first.first.delete();
    expect(test.first.hasChild()).toBe(false);
    expect(test.first.parent.id === "master").toBe(true);
    expect(test.first.id === secondId).toBe(true);
    expect(test.boundingBox).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });
  it("originNodeIsRootFirst && !originNodeParentCase && sibilingHasChildCase", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.second.split();
    test.first.second.first.split();
    test.first.second.first.first.split();
    const secondId = test.first.second.id;
    test.first.first.delete();
    expect(test.first.hasChild()).toBe(true);
    expect(test.first.first.hasChild()).toBe(true);
    expect(test.first.parent.id === "master").toBe(true);
    expect(test.first.id === secondId).toBe(true);
  });

  it("!originNodeIsRootFirst && originNodeParentCase &&sibilingHasChildCase", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.first.split();
    test.first.first.second.split();
    test.first.first.second.first.split();
    test.first.first.second.first.second.split();
    const parentNode = test.first.first.second.first;
    const parentParent = test.first.first.second;
    const originNode = test.first.first.second;
    const sibilingLocation = test.first.first.second.first.location;
    const sibiling = test.first.first.second.first.second;
    test.first.first.second.first.first.delete();

    expect(test.first.first.second.first.first.hasChild()).toBe(false);
    expect(parentParent[parentNode.location].id === sibiling.id).toBe(true);
    expect(sibiling.parent.id === parentParent.id).toBe(true);
    expect(sibiling.hasChild()).toBe(true);
    expect(sibiling.location === sibilingLocation).toBe(true);
    expect(originNode.id === sibiling.origin.id).toBe(true);
  });

  it("!originNodeIsRootFirst &&originNodeParentCase && !sibilingHasChildCase", () => {
    const test = new MosaicNode().init();

    test.first.first.second.first.first.delete();

    // expect(test.first.first.second.first.first.hasChild()).toBe(false);
    // expect(parentParent[parentNode.location].id === sibiling.id).toBe(true);
    // expect(sibiling.parent.id === parentParent.id).toBe(true);
    // expect(sibiling.hasChild()).toBe(true);
    // expect(sibiling.location === sibilingLocation).toBe(true);
    // expect(originNode.id === sibiling.origin.id).toBe(true);
  });
});
