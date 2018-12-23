require("dotenv-safe").config();

import {
  close,
  count,
  push
} from "@theguarantors/queue";

count("hubspot")
  .tap(console.log)
  .then(() => push("hubspot", { action: "answer", data: 42 }))
  .then(() => count("hubspot"))
  .tap(console.log)
  .finally(close);
