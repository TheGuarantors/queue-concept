require("dotenv-safe").config();

import {
  QueueableData,
  QueueablesMap,
  work,
} from "@theguarantors/queue";
import { getLogger } from "./logger";

function getAnswer(data: QueueableData) {
  return new Promise(resolve => setTimeout(resolve.bind(null, data), 3000));
}

const queueables: QueueablesMap = {
  "answer": getAnswer
};

setInterval(() => work("hubspot", queueables, getLogger()), 500);
