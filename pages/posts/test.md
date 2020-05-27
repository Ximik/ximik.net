---
title: Test page
description: Just a test page.
date: 2020-05-27
---
# Title $\xi_x$
## Subtitle $\xi_x$

[link](https://github.com).

$$\xi_x$$

```javascript
import { promises as fs } from "fs";
import { join } from "path";
import { Tex2Svg, Tex2SvgImgTag, math, tikz } from "../lib/index.js";

const blocks = [
  {
    code: "\\LaTeX",
    depth: true, // the blocks with depth can be vertically aligned
  },
  math("\\zeta(s) = \\sum\\limits_{n=1}^\\infty 1 / n^s", true),
  math("\\zeta(s) = \\sum\\limits_{n=1}^\\infty 1 / n^s"),
  tikz(
    // From https://cremeronline.com/LaTeX/minimaltikz.pdf
    "\\draw [blue] (0,0) rectangle (1.5,1); \\draw [red, ultra thick] (3,0.5) circle [radius=0.5]; \\draw [gray] (6,0) arc [radius=1, start angle=45, end angle= 120];"
  ),
  tikz(
    "\\node (a) {A}; \\node (b) at (1,0) {B};\\draw [open triangle 45-triangle 45] (a) -- (b);",
    ["arrows"]
  ),
];
```

!!!arrows
\node (a) {A}; \node (b) at (1,0) {B};\draw [open triangle 45-triangle 45] (a) -- (b);
!!!
