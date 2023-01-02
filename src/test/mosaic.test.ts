import { MosaicNode } from "../mosaic";

const test = new MosaicNode().init();

describe("mosaicNode test ", () => {
  it("mosaic 최초 생성 id", () => {
    expect(new MosaicNode().init().id).toBe("master");
  });
});
