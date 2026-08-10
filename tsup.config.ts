import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      cli: "src/cli.ts",
    },
    format: ["esm"],
    dts: false,
    sourcemap: true,
    clean: true,
    target: "node20",
  },
  {
    entry: {
      action: "src/action.ts",
    },
    format: ["cjs"],
    dts: false,
    sourcemap: false,
    clean: false,
    noExternal: [/.*/],
    target: "node20",
  },
]);
