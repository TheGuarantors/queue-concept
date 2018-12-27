import * as Promise from "bluebird";
import { expect } from "../matchers";
import { withRollback } from "../cleaner";
import { count } from "../../src/operations/count";
import { push } from "../../src/operations/push";
import { queueInstance } from "../../src/init";
import { Message } from "../../../queue/src/types";

describe("Queue.Operations.Push", function() {
  before(function() {
    return queueInstance.truncate({ cascade: true });
  });

  const queue1: string = "queue1";
  const queue2: string = "queue2";

  const validMessage: Message = {
    action: "add-contact-to-company",
    data: "This is a valid message"
  };

  context("when we push a message to a queue", function() {
    it("gets added to the queue", () =>
      withRollback(() => {
        return expect(
          Promise.join(
            push(queue1, validMessage),
            push(queue1, validMessage),
            push(queue2, validMessage),
            () =>
              Promise.join(count(queue1), count(queue2), (count1, count2) => ({
                queue1: count1,
                queue2: count2
              }))
          )
        ).to.be.fulfilled.then(({ queue1, queue2 }) => {
          expect(queue1).to.be.eql(2);
          expect(queue2).to.be.eql(1);
        });
      }));
  });
});
