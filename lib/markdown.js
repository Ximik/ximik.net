import YAML from "yaml";
import Renderer from "./markdown/renderer.js";
import Scanner from "./markdown/scanner.js";
import { Tex2SvgFile } from "tex2svg";

const compiler = new Tex2SvgFile({
  preamble: "\\usepackage{cmbright}",
});

export default async function (filepath) {
  const scanner = new Scanner(filepath);
  const yaml = scanner.scanHeader();
  const header = yaml ? YAML.parse(yaml) : {};
  const body = await new Renderer(scanner, compiler).render();
  return { header, body };
}
