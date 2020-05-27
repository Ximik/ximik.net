import { promises as fs } from "fs";
import glob from "glob";
import markdown from "./lib/markdown.js";
import layout from "./layout.js";

const OUT_DIR = "site";

async function buildPages() {
  const filepaths = glob.sync("**/*.md", { cwd: "pages" });
  const headers = [];
  for (const filepath of filepaths) {
    const { header, body } = await markdown("pages/" + filepath);
    const path = filepath.slice(0, -3);
    await fs.mkdir(OUT_DIR + "/" + path, { recursive: true });
    await fs.writeFile(
      OUT_DIR + "/" + path + "/index.html",
      layout(`<article><h1>${header.title}</h1>${body}</article>`, header)
    );
    headers.push({ ...header, path });
  }
  headers.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    }
    if (a.date < b.date) {
      return 1;
    }
    return 0;
  });
  return headers;
}

buildPages().then((headers) =>
  fs.writeFile(
    OUT_DIR + "/index.html",
    layout(
      headers
        .map(
          ({ title, description, path }) =>
            `<article class="index"><header><a href="${path}">${title}</a></header>${description}</article>`
        )
        .join(""),
      { title: "Home" }
    )
  )
);
