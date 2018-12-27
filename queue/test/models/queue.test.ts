import { expect } from "../matchers";
import { queueInstance } from "../../src/init";
import { withRollback } from "../cleaner";

describe("Queue", function() {
  before(function() {
    return queueInstance.truncate({ cascade: true });
  });

  describe("#queue", function() {
    context("when there are validation errors on the field", function() {
      context("and the given value is null", function() {
        it("returns the validation error", () =>
          withRollback(() => {
            return expect(
              queueInstance.build({
                queue: null
              }).validate()
            ).to.be.rejectedWith("queue cannot be null");
          }));
      });
    });

    context("when there are no validation errors on the field", function() {
      context("and the given value is a string", function() {
        it("does not include validation error", () =>
          withRollback(() => {
            return expect(
              queueInstance.build({
                queue: "alien-queue"
              }).validate()
            ).to.be.not.rejectedWith("queue cannot be null");
          }));
      });
    });
  });

  describe("#message", function() {
    context("when there are validation errors on the field", function() {
      context("and the given value is null", function() {
        it("returns the validation error", () =>
          withRollback(() => {
            return expect(
              queueInstance.build({
                message: null
              }).validate()
            ).to.be.rejectedWith("message cannot be null");
          }));
      });
    });

    context("when there are no validation errors on the field", function() {
      context("and the given value is a string", function() {
        it("does not include validation error", () =>
          withRollback(() => {
            return expect(
              queueInstance.build({
                message: "E.T. Phone Home"
              }).validate()
            ).to.be.not.rejectedWith("message cannot be null");
          }));
      });
    });
  });
});
