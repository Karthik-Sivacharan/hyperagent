import type { GlyphShape } from "../../types";
import { archGhost } from "./arch-ghost";
import { cog } from "./cog";
import { domeWalker } from "./dome-walker";
import { hourglass } from "./hourglass";
import { notchedBlock } from "./notched-block";
import { orbStems } from "./orb-stems";
import { pedestal } from "./pedestal";
import { plugArrow } from "./plug-arrow";

/** The study set, in loop order. Owned by the study-shapes agent. */
export const STUDY_SHAPES: readonly GlyphShape[] = [
  cog,
  notchedBlock,
  plugArrow,
  domeWalker,
  pedestal,
  archGhost,
  orbStems,
  hourglass,
];
