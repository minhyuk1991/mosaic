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
    expect(test.first).toBe(secondId);
    expect(test.first.first).toBe(null);
    expect(test.first.second).toBe(null);
  });

  it("delete depth1-replica", () => {
    const test = new MosaicNode().init();
    test.first.split();
    test.first.first.split();
    test.first.first.split();
    test.first.first.second.split();
    test.first.first.second.first.split();
    const first = test.first.first;
    const nextFirstFirst = test.first.first.second;
    const target = test.first.first.first.delete();
    expect(test.first.first.id).toEqual(nextFirstFirst.id);
    // const second = test.first.second;
    // const secondId = second.id;
    // first.delete();
    // expect(test.first).toBe(secondId);
    // expect(test.first.first).toBe(null);
    // expect(test.first.second).toBe(null);
  });
});
