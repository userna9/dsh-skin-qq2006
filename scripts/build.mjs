/**
 * Build step: inline src/skin.css (with the penguin artwork base64-encoded)
 * into src/client.template.js and write lib/client.js.
 *
 *   node scripts/build.mjs
 *
 * No dependencies, no bundler — the DSH Web UI loads a plain ES module, so the
 * only job here is moving the stylesheet into the module as one string.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(resolve(root, p), "utf8");

const [css, svg, template] = await Promise.all([
  read("src/skin.css"),
  read("src/penguin.svg"),
  read("src/client.template.js"),
]);

const penguin = "data:image/svg+xml;base64," + Buffer.from(svg.trim()).toString("base64");

if (!css.includes("__PENGUIN__")) {
  throw new Error("src/skin.css lost its __PENGUIN__ placeholder");
}

const skin = css.replaceAll("__PENGUIN__", penguin);
const output = template.replace("__CSS__", JSON.stringify(skin));

if (output.includes("__CSS__") || output.includes("__PENGUIN__")) {
  throw new Error("template placeholders were not fully replaced");
}

await writeFile(resolve(root, "lib/client.js"), output, "utf8");

const bytes = Buffer.byteLength(output);
console.log(`lib/client.js written (${(bytes / 1024).toFixed(1)} kB, css ${(skin.length / 1024).toFixed(1)} kB)`);
