import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

export default {
  resolve: {
    alias: {
      chibivue: path.resolve(dirname, "../../packages"),
    },
  },
};
