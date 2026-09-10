import { FULL_MARK_PATH, MARK_VIEWBOX } from "./logo-motion/mark-geometry";

// The mark as a flat glyph: one path, `currentColor`, no filters and no
// motion. Everything in `logo-motion/` is a performance — an entrance, a
// hover, a loop — and all of it is built for 40px and up, where the material
// filters have room to read. This is the other job: the mark standing in for
// an icon, at icon sizes, inheriting the colour of whatever it sits in.
//
// `FULL_MARK_PATH` is the three shapes concatenated into one subpath set. They
// never overlap (the S arcs around both discs at a constant 1.6-unit gap), so
// the default nonzero fill rule paints them solid with no cutouts.
//
// aria-hidden always: at this size it is decoration beside a label, never the
// thing being named. If you need the mark to BE the name, use a motion variant
// with its `label` prop.
export function Mark({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}`}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d={FULL_MARK_PATH} fill="currentColor" />
    </svg>
  );
}
