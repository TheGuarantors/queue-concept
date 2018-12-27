import * as sinon from "sinon";
import factory from "../factory";
import { work } from "../../src/operations/work";
import { expect } from "../matchers";
import { queueInstance } from "../../src/init";
import { push } from "../../src/operations/push";
import { Message, QueueablesMap, Logger } from "../../src/types";
import { InvalidQueueMessageError } from "../../src/errors";
import { withRollback } from "../cleaner";

describe("Queue.Operations.Work", function() {
  this.beforeEach(function() {
    return queueInstance.truncate({ cascade: true });
  });

  const queue: string = "queue";

  const logger = {
    info: _msg => {},
    error: _msg => {}
  } as Logger;

  const firstTask = sinon.stub();
  const secondTask = sinon.stub();

  const validMessage1: Message = {
    action: "add-contact-to-company",
    data: "This is a valid message that does some work"
  };

  const validMessage2: Message = {
    action: "create-broker-from-questionnaire-email",
    data: "This is a valid message that does some more work"
  };

  const queueables: QueueablesMap = {
    "add-contact-to-company": firstTask,
    "create-broker-from-questionnaire-email": secondTask
  };

  const requestErrorMessage: QueueablesMap = {
    "add-contact-to-company": sinon.stub().rejects({ message: "RequestError" })
  };

  const statusCodeErrorMessage: QueueablesMap = {
    "add-contact-to-company": sinon.stub().rejects({ message: "StatusCodeError" })
  };

  const unhandledErrorMessage: QueueablesMap = {
    "add-contact-to-company": sinon.stub().rejects({ message: "A weird error" })
  };

  context("when we push messages to a queue", function() {
    context("and message is invalid", function() {
      context("because json is not well formed", function() {
        it("gets rejected with the correct error", () =>
          withRollback(() => {
            return expect(
              factory.create("queue", { queue, message: "" }).then(() => work(queue, queueables, logger))
            ).to.be.rejectedWith(InvalidQueueMessageError);
          }));

        it("sets status to invalid-message", () =>
          withRollback(() => {
            return expect(
              factory
                .create("queue", { queue, message: "" })
                .then(() => work(queue, queueables, logger))
                .catch(() => queueInstance.findOne())
            ).to.eventually.has.property("status", "invalid-message");
          }));
      });

      context("because action is not implemented", function() {
        it("gets rejected with the correct error", () =>
          withRollback(() => {
            return expect(
              factory
                .create("queue", {
                  queue,
                  message: "{'action': 'foo', 'data': {}}"
                })
                .then(() => work(queue, queueables, logger))
            ).to.be.rejectedWith(InvalidQueueMessageError);
          }));

        it("sets status to invalid-message", () =>
          withRollback(() => {
            return expect(
              factory
                .create("queue", {
                  queue,
                  message: "{'action': 'foo', 'data': {}}"
                })
                .then(() => work(queue, queueables, logger))
                .catch(() => queueInstance.findOne())
            ).to.eventually.has.property("status", "invalid-message");
          }));
      });
    });

    context("and there is a 'RequestError' error", function() {
      it("gets rejected with the correct error", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1).then(() => work(queue, requestErrorMessage, logger))
          ).to.be.rejectedWith("RequestError");
        }));

      it("sets status to unprocessed", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1)
              .then(() => work(queue, requestErrorMessage, logger))
              .catch(() => queueInstance.findOne())
          ).to.eventually.has.property("status", "unprocessed");
        }));
    });

    context("and there is a 'StatusCodeError' error", function() {
      it("gets rejected with the correct error", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1).then(() => work(queue, statusCodeErrorMessage, logger))
          ).to.be.rejectedWith("StatusCodeError");
        }));

      it("sets status to hubspot-status-code-error", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1)
              .then(() => work(queue, statusCodeErrorMessage, logger))
              .catch(() => queueInstance.findOne())
          ).to.eventually.has.property("status", "hubspot-status-code-error");
        }));

      it("sets statusMessage to the corresponding error message", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1)
              .then(() => work(queue, statusCodeErrorMessage, logger))
              .catch(() => queueInstance.findOne())
          ).to.eventually.have.property("statusMessage", "StatusCodeError");
        }));
    });

    context("and there is an unexpected error", function() {
      it("gets rejected with the correct error", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1).then(() => work(queue, unhandledErrorMessage, logger))
          ).to.be.rejectedWith("Unhandled Error");
        }));

      it("sets status to unhandled-error", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1)
              .then(() => work(queue, unhandledErrorMessage, logger))
              .catch(() => queueInstance.findOne())
          ).to.eventually.has.property("status", "unhandled-error");
        }));

      it("sets statusMessage to the corresponding error message", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1)
              .then(() => work(queue, unhandledErrorMessage, logger))
              .catch(() => queueInstance.findOne())
          ).to.eventually.have.property("statusMessage", "A weird error");
        }));
    });

    context("and there is no errors", function() {
      it("gets fulfilled", () =>
        withRollback(() => {
          return expect(push(queue, validMessage1).then(() => work(queue, queueables, logger))).to.be.fulfilled;
        }));

      it("deletes the entry", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1)
              .then(() => work(queue, queueables, logger))
              .then(() => queueInstance.findAll())
          ).to.eventually.be.empty;
        }));
    });

    context("and process the queue for those messages", function() {
      it("should execute the worker functions", () =>
        withRollback(() => {
          return expect(
            push(queue, validMessage1)
              .then(() => push(queue, validMessage2))
              .then(() => work(queue, queueables, logger))
          ).to.be.fulfilled.then(() => {
            expect(firstTask).to.be.calledThrice;
            expect(secondTask).to.not.be.called;
          });
        }));
    });
  });
});
