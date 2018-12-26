require("dotenv-safe").config();

import {
  QueueableData,
  QueueablesMap,
  work,
  // close
} from "@theguarantors/queue";

function getAnswer(data: QueueableData) {
  // return data;
  return new Promise(resolve => setTimeout(resolve.bind(null, data), 3000));
}

const queueables: QueueablesMap = {
  "answer": getAnswer
};

// work("hubspot", queueables).finally(close);
setInterval(() => work("hubspot", queueables), 500);
