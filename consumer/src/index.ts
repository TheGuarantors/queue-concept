require("dotenv-safe").config();

import {
  QueueableData,
  QueueablesMap,
  work,
  close
} from "@theguarantors/queue";

function getAnswer(data: QueueableData) {
  return data;
}

const queueables: QueueablesMap = {
  "answer": getAnswer
};

work("hubspot", queueables)
  .finally(close);
