import { expect } from "../matchers";
import { queueInstance } from "../../src/init";
import { take } from "../../src/operations/take";
import { push } from "../../src/operations/push";

import { Message } from "../../../queue/src/types";
import { withRollback } from "../cleaner";

describe("Queue.Operations.Take", function() {
  this.beforeEach(function() {
    return queueInstance.truncate({ cascade: true });
  });

  const queue: string = "queue";

  const validMessage1: Message = {
    action: "add-contact-to-company",
    data: "This is a valid message"
  };

  const validMessage2: Message = {
    action: "create-broker-from-questionnaire-email",
    data: "This is another valid message"
  };

  const validMessage3: Message = {
    action: "create-broker-from-questionnaire-name",
    data: "This is yet another valid message"
  };

  context("when we have things in the queue", function() {
    it("returns oldest element from the queue", () =>
      withRollback(() => {
        return expect(
          push(queue, validMessage1)
            .then(() => push(queue, validMessage2))
            .then(() => push(queue, validMessage3))
            .then(() => take(queue))
        ).to.be.fulfilled.then(queueRecords => {
          expect(queueRecords).to.have.lengthOf(1);
          const message = JSON.parse(queueRecords[0].message);
          expect(message.action).to.be.eql(validMessage1.action);
          expect(message.data).to.be.eql(validMessage1.data);
        });
      }));
  });

  context("when we don't have things in the queue", function() {
    it("returns empty list", function() {
      return expect(take(queue)).to.become([]);
    });
  });
});
