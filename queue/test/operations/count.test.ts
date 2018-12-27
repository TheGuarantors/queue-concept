import * as Promise from "bluebird";
import { count } from "../../src/operations/count";
import { push } from "../../src/operations/push";
import { expect } from "../matchers";
import { queueInstance } from "../../src/init";
import { Message } from "../../src/types";
import { withRollback } from "../cleaner";

describe("Queue.Operations.Count", function() {
  beforeEach(function() {
    return queueInstance.truncate({ cascade: true });
  });

  const queue1: string = "queue1";

  const validMessage: Message = {
    action: "add-contact-to-company",
    data: "This is a valid message"
  };

  context("when we push messages to a queue", function() {
    it("returns the correct number of messages", () =>
      withRollback(() => {
        return expect(
          Promise.join(
            push(queue1, validMessage),
            push(queue1, validMessage),
            push(queue1, validMessage),
            () => count(queue1)
          )
        ).to.eventually.be.eql(3);
      }));
  });

  context("when a queue is empty", function() {
    it("returns zero", function() {
      return expect(count(queue1)).to.eventually.be.eql(0);
    });
  });
});
