import { readFileSync } from "fs";

export const TEXT = "TEXT";
export const WHITESPACE = "WHITESPACE";
export const HEADING = "HEADER";
export const LINK = "LINK";
export const DISPLAY_CODE = "DISPLAY_CODE";
export const INLINE_CODE = "INLINE_CODE";
export const DISPLAY_MATH = "DISPLAY_MATH";
export const INLINE_MATH = "INLINE_MATH";
export const TIKZ = "TIKZ";

const BACKSLASH = "\\";
const HEADER = "---";
const BACKTICK = "`";
const LBRACKET = "[";
const RBRACKET = "]";
const LBRACE = "(";
const RBRACE = ")";
const HASH = "#";
const EXCLAMATION = "!";
const DOLLAR = "$";
const SPACE = " ";
const TAB = "\t";
const NEWLINE = "\n";

export default class Scanner {
  constructor(filepath) {
    this.text = readFileSync(filepath, "utf8");
    this.pos = 0;
    this.bol = true;
  }

  readChar() {
    if (this.pos >= this.text.length) {
      return;
    }
    return this.text[this.pos++];
  }

  skipString(string) {
    const success = this.text.startsWith(string, this.pos);
    if (success) {
      this.pos += string.length;
    }
    return success;
  }

  readTillString(string, escapable = false, preserve = false) {
    let text = "";
    while (!this.skipString(string)) {
      let char = this.readChar();
      if (escapable && char === BACKSLASH) {
        if (preserve) {
          text += char;
        }
        char = this.readChar();
      }
      if (char === undefined) {
        break;
      }
      text += char;
    }
    return text;
  }

  scanHeader() {
    if (!this.skipString(HEADER + NEWLINE)) {
      return;
    }
    return this.readTillString(NEWLINE + HEADER + NEWLINE);
  }

  scanToken() {
    const char = this.readChar();
    if (char === undefined) {
      return;
    }
    const bol = this.bol;
    this.bol = false;
    if (char === BACKSLASH) {
      const c = this.readChar();
      if (
        c === BACKSLASH ||
        c === BACKTICK ||
        c === LBRACKET ||
        c === RBRACKET ||
        c === LBRACE ||
        c === RBRACE ||
        c === HASH ||
        c === EXCLAMATION ||
        c === DOLLAR
      ) {
        return { type: TEXT, text: c };
      }
      return { type: TEXT, text: char + c };
    }
    if (char === SPACE || char === TAB || char === NEWLINE) {
      let lines = char === NEWLINE ? 1 : 0;
      do {
        while (this.skipString(SPACE) || this.skipString(TAB)) {}
        lines++;
      } while (this.skipString(NEWLINE));
      this.bol = lines !== 1;
      return { type: WHITESPACE, lines };
    }
    if (bol && char === HASH) {
      let level = 1;
      while (this.skipString(HASH)) {
        level++;
      }
      return { type: HEADING, level };
    }
    if (char === LBRACKET) {
      const text = this.readTillString(RBRACKET, true);
      if (!this.skipString(LBRACE)) {
        return { type: TEXT, text: LBRACKET + text + RBRACKET };
      }
      const href = this.readTillString(RBRACE);
      return { type: LINK, text, href };
    }
    if (char === BACKTICK) {
      if (bol && this.skipString(BACKTICK + BACKTICK)) {
        const lang = this.readTillString(NEWLINE);
        const text = this.readTillString(
          NEWLINE + BACKTICK + BACKTICK + BACKTICK
        );
        return { type: DISPLAY_CODE, lang, text };
      }
      return { type: INLINE_CODE, text: this.readTillString(BACKTICK, true) };
    }
    if (char === DOLLAR) {
      if (bol && this.skipString(DOLLAR)) {
        const text = this.readTillString(DOLLAR + DOLLAR);
        return { type: DISPLAY_MATH, text };
      }
      const text = this.readTillString(DOLLAR, true, true);
      return { type: INLINE_MATH, text };
    }
    if (
      bol &&
      char === EXCLAMATION &&
      this.skipString(EXCLAMATION + EXCLAMATION)
    ) {
      const packages = this.readTillString(NEWLINE)
        .split(" ")
        .filter((p) => p);
      const text = this.readTillString(
        NEWLINE + EXCLAMATION + EXCLAMATION + EXCLAMATION
      );
      return { type: TIKZ, packages, text };
    }
    return { type: TEXT, text: char };
  }
}
