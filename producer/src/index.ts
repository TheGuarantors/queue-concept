require("dotenv-safe").config();

import { getCount, close } from "@theguarantors/queue";
import { pr2 } from "./pr-2";

getCount()
  .tap(console.log)
  .then(pr2)
  .tap(console.log)
  .finally(close);
