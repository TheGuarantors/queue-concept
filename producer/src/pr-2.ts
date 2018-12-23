import { getCount } from "@theguarantors/queue";

export function pr2(): any {
  return getCount()
    .then((count: any) => count + 42);
}
