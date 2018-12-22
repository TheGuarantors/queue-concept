import { expect } from "./matchers";

describe("TEST", function() {
  context("when something", function() {
    it("works", function() {
      expect(42).to.eql(42);
    });
  });
});
