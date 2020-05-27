import { readFileSync, writeFileSync } from "fs";
import postcss from "postcss";
import atImport from "postcss-import";
import cssnano from "cssnano";

const OUT_DIR = "site";

const css = readFileSync("styles/main.css", "utf8");

postcss()
  .use(atImport())
  .use(
    cssnano({
      preset: "default",
    })
  )
  .process(css, {
    from: "styles/main.css",
  })
  .then(({ css }) => writeFileSync(OUT_DIR + "/main.css", css));
