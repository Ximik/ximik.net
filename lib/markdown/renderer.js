import {
  TEXT,
  WHITESPACE,
  HEADING,
  LINK,
  IMAGE,
  DISPLAY_CODE,
  INLINE_CODE,
  DISPLAY_MATH,
  INLINE_MATH,
  TIKZ,
} from "./scanner.js";
import { math, tikz } from "tex2svg";
import hljs from "highlight.js";

const escapeHTML = (text) =>
  text.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m])
  );
const highlightCode = (lang, text) => hljs.highlight(lang, text).value;

export default class Renderer {
  constructor(scanner, compiler) {
    this.scanner = scanner;
    this.compiler = compiler;
    this.result = "";
    this.ptag = null;
    this.blocks = [];
  }

  pbegin(tag) {
    if (this.ptag) {
      return;
    }
    this.result += `<${tag}>`;
    this.ptag = tag;
  }

  pend() {
    if (!this.ptag) {
      return;
    }
    this.result += `</${this.ptag}>`;
    this.ptag = null;
  }

  block(block) {
    this.result += "<tex>";
    this.blocks.push(block);
  }

  render() {
    let token;
    while ((token = this.scanner.scanToken())) {
      switch (token.type) {
        case TEXT:
          this.pbegin("p");
          this.result += escapeHTML(token.text);
          break;
        case WHITESPACE:
          if (token.lines !== 1 && (token.lines !== 2 || this.ptag !== "p")) {
            this.pend();
          } else {
            this.result += " ";
          }
          break;
        case HEADING:
          this.pend();
          this.pbegin(`h${token.level + 1}`);
          break;
        case LINK:
          this.pbegin("p");
          this.result += `<a href="${escapeHTML( token.href)}" target="_blank">${escapeHTML(token.text)}</a>`;
          break;
        case IMAGE:
          // if (size) {}
          this.pbegin("p")
          this.result += `<img src="${escapeHTML( token.src)}" alt="${escapeHTML(token.alt)}"></img>`;
          break;
        case DISPLAY_CODE:
          this.pend();
          this.result += `<pre class="hljs"><code>`;
          this.result += token.lang
            ? highlightCode(token.lang, token.text)
            : escapeHTML(token.text);
          this.result += `</code></pre>`;
          break;
        case INLINE_CODE:
          this.pbegin("p");
          this.result += `<code class="hljs">${escapeHTML(token.text)}</code>`;
          break;
        case DISPLAY_MATH:
          this.pend();
          this.result += '<div class="math">';
          this.block(math(token.text, false));
          this.result += "</div>";
          break;
        case INLINE_MATH:
          this.pbegin("p");
          this.block(math(token.text, true));
          break;
        case TIKZ:
          this.pend();
          this.result += '<div class="tikz">';
          this.block(tikz(token.text, token.packages));
          this.result += "</div>";
          break;
      }
    }
    this.pend();
    return this.compiler.compile(this.blocks).then((blocks) => {
      let i = 0;
      return this.result.replace(/<tex>/g, () => blocks[i++]);
    });
  }
}
