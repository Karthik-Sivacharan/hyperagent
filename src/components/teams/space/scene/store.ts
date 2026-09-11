import { cubicBezier } from "motion/react";

import { DURATION, EASE } from "@/lib/motion";
import type { ActorId, Facing, Placement, Pose, Seat, Tile } from "@/components/teams/space/types";
import {
  BASELINE,
  FRAME,
  FRAME_MS,
  SIT_DROP,
  TILE,
  frameOf,
  framePosition,
  headInset,
  isWalkable,
  nearestFree,
  pathTo,
  seatAt,
  seatOf,
  tileKey,
} from "@/components/teams/space/scene/world";

// The office's positions store (docs/plans/2026-09-11-teams-space-v1.md §4,
// §5). Every character's live position lives here, in tiles, as floats; one
// requestAnimationFrame loop advances walkers, swaps sprite frames and moves
// the chrome that follows a character (tags, bubbles, the ask card), all by
// writing styles through refs. React never renders per frame: a character's
// tile, facing and seat are COMMITTED to an immutable snapshot only when they
// change (a step lands, a drop settles, someone sits), and the view reads that
// snapshot for everything that depends on where people are: proximity groups,
// the ask card, accessible names.
//
// MOTION. Walking is constant speed, so it is linear: six tiles a second, the
// walk cycle at the sprite sheet's frame time, facing turned by each step.
// Seated working agents loop their typing (or, at the meeting table,
// reading) frames, each on its own phase so a room never types in unison.
// A drop settles into its tile in 150ms on ease-out. Reduced motion: steps
// jump tile to tile (at the same cadence while a key is held), a
// click-to-walk teleports, a drop lands at once, and every cycle holds its
// first frame.
//
// SPACE. One coordinate system: px = tile * TILE * scale. A character's tile
// is where it stands; its sprite (FRAME, a tile wide and two tall) is drawn
// as Pixel Agents draws it, bottom-centre on the tile's centre (seated a
// little lower), and its z-index is the tile's bottom edge in px, which
// interleaves it with the furniture (whose z-index is its own bottom edge).

export const WALK_TILES_PER_SECOND = 6;
const STEP_MS = 1000 / WALK_TILES_PER_SECOND;
const SETTLE_MS = DURATION.fast * 1000;
/** Taps ahead of the walker that still each take a tile. */
const MAX_QUEUED = 4;
/** Over every sprite (the tallest map is well under this in px) and under the chrome. */
export const DRAG_Z = 19000;
export const CHROME_Z = 20000;

const settleEase = cubicBezier(...EASE.out);

const DELTA: Record<Facing, Tile> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function facingOf(from: Tile, to: Tile, fallback: Facing): Facing {
  if (to.x > from.x) return "right";
  if (to.x < from.x) return "left";
  if (to.y > from.y) return "down";
  if (to.y < from.y) return "up";
  return fallback;
}

const same = (a: Tile, b: Tile) => a.x === b.x && a.y === b.y;

/** What a character does when it is not walking: its pose, and whether the pose cycles. */
export interface Rest {
  pose: Pose;
  animate: boolean;
}

export type RestFor = (id: ActorId, seat: Seat | null) => Rest;

export interface ActorSnapshot {
  tile: Tile;
  facing: Facing;
  /** The seat it sits on, when it is at rest on one. */
  seat: string | null;
  /** Walking, dragged or settling. */
  moving: boolean;
  dragging: boolean;
}

export type SceneSnapshot = Readonly<Record<ActorId, ActorSnapshot>>;

/** A character's box in stage px, rounded as it is painted. */
export interface ActorBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** The bottom edge of its tile: the depth line it sorts by (a seated sprite hangs a little below it). */
  feet: number;
  cx: number;
  /** The top of the head, where a tag's caret points. */
  head: number;
}

interface Step {
  kind: "step";
  from: Tile;
  to: Tile;
  t0: number;
  /** Reduced motion: the tile changed at once and the step only holds the cadence. */
  jump: boolean;
}

interface Settle {
  kind: "settle";
  fx: number;
  fy: number;
  to: Tile;
  t0: number;
}

class Actor {
  x: number;
  y: number;
  path: Tile[] = [];
  motion: Step | Settle | null = null;
  dragging = false;
  walkStart = 0;
  root: HTMLElement | null = null;
  sprite: HTMLElement | null = null;
  written = { transform: "", z: -1, frame: "" };

  constructor(
    readonly id: ActorId,
    public tile: Tile,
    public facing: Facing,
    public seat: string | null,
    /** A per-character offset into the typing cycle, so a room never types in unison. */
    readonly phase: number,
  ) {
    this.x = tile.x;
    this.y = tile.y;
  }
}

interface Follower {
  el: HTMLElement;
  anchor: () => { x: number; y: number } | null;
  written: string;
}

function phaseOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 1000;
}

export class SceneStore {
  private readonly actors = new Map<ActorId, Actor>();
  private readonly listeners = new Set<() => void>();
  private readonly followers = new Set<Follower>();
  private readonly pending = new Set<ActorId>();
  private snapshot: SceneSnapshot;
  private raf = 0;
  private scale = 1;
  private reduced = false;
  /** Something moved (or the scale changed) since the chrome was last placed. */
  private moved = true;

  // The keyboard walker (you): the keys held, most recent last, and the
  // presses not yet walked, so taps faster than a step still each take a tile.
  private held: Facing[] = [];
  private queued: Facing[] = [];

  constructor(
    placements: Record<ActorId, Placement>,
    private readonly walker: ActorId,
    private readonly rest: RestFor,
  ) {
    const snapshot: Record<ActorId, ActorSnapshot> = {};
    for (const [id, placement] of Object.entries(placements)) {
      const actor = new Actor(id, { ...placement.tile }, placement.facing, placement.seat ?? null, phaseOf(id));
      this.actors.set(id, actor);
      snapshot[id] = this.snap(actor);
    }
    this.snapshot = snapshot;
  }

  // React side ---------------------------------------------------------------

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;

  start() {
    if (this.raf) return;
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  setScale(scale: number) {
    if (scale === this.scale) return;
    this.scale = scale;
    for (const actor of this.actors.values()) actor.written = { transform: "", z: -1, frame: "" };
    for (const follower of this.followers) follower.written = "";
    this.repaint();
  }

  setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
  }

  /** A character's DOM: the positioned root and the sprite whose frame swaps. */
  bind(id: ActorId, root: HTMLElement, sprite: HTMLElement) {
    const actor = this.actors.get(id);
    if (!actor) return () => {};
    actor.root = root;
    actor.sprite = sprite;
    actor.written = { transform: "", z: -1, frame: "" };
    this.paint(actor, performance.now());
    return () => {
      if (actor.root === root) {
        actor.root = null;
        actor.sprite = null;
      }
    };
  }

  /** Keeps `el` translated to `anchor()` (stage px) as characters move. */
  follow(el: HTMLElement, anchor: () => { x: number; y: number } | null) {
    const follower: Follower = { el, anchor, written: "" };
    this.followers.add(follower);
    this.place(follower);
    return () => {
      this.followers.delete(follower);
    };
  }

  /** The character's box in stage px, where it is right now. */
  box(id: ActorId): ActorBox | null {
    const actor = this.actors.get(id);
    if (!actor) return null;
    const t = TILE * this.scale;
    const left = Math.round(actor.x * t);
    const feet = Math.round((actor.y + 1) * t);
    const bottom = Math.round(actor.y * t) + (BASELINE + (this.sitting(actor) ? SIT_DROP : 0)) * this.scale;
    const top = bottom - FRAME.h * this.scale;
    const width = FRAME.w * this.scale;
    return { left, top, right: left + width, bottom, feet, cx: left + width / 2, head: top + headInset(id) * this.scale };
  }

  /** At rest on a seat in a seated pose (typing, reading, or sitting still). */
  private sitting(actor: Actor): boolean {
    if (actor.dragging || actor.motion || !actor.seat) return false;
    return this.rest(actor.id, seatOf(actor.seat)).pose !== "idle";
  }

  /** Where the head of `id` would be, seated on `tile`, in stage px (an empty desk's tag). */
  tileHead(t: Tile, id: ActorId) {
    const size = TILE * this.scale;
    const top = t.y * size + (BASELINE + SIT_DROP - FRAME.h) * this.scale;
    return { x: t.x * size + (FRAME.w * this.scale) / 2, y: top + headInset(id) * this.scale };
  }

  // Commands -----------------------------------------------------------------

  /** Walks a character to `target` along the path finder's route. False when there is no way. */
  walkTo(id: ActorId, target: Tile): boolean {
    const actor = this.actors.get(id);
    if (!actor || actor.dragging) return false;
    const from = actor.motion?.kind === "step" ? actor.motion.to : actor.tile;
    const path = pathTo(from, target);
    if (!path || path.length === 0) return false;
    if (id === this.walker) this.releaseAll();
    if (this.reduced) {
      const before = path.length > 1 ? path[path.length - 2] : from;
      actor.motion = null;
      actor.path = [];
      actor.facing = facingOf(before, target, actor.facing);
      this.land(actor, target);
      this.comeToRest(actor);
    } else {
      actor.path = path;
      if (!actor.motion) this.next(actor, performance.now());
    }
    this.flush();
    return true;
  }

  /**
   * An arrow or WASD key went down. A fresh press always takes its tile (it
   * is queued if you are mid-step); the OS's auto-repeat only keeps the key
   * held, so letting go never overshoots by a queued tile.
   */
  press(dir: Facing, repeat = false) {
    if (!this.held.includes(dir)) this.held.push(dir);
    if (repeat) return;
    if (this.queued.length < MAX_QUEUED) this.queued.push(dir);
    const actor = this.actors.get(this.walker);
    if (!actor || actor.dragging) return;
    actor.path = [];
    if (!actor.motion) this.next(actor, performance.now());
    this.flush();
  }

  release(dir: Facing) {
    this.held = this.held.filter((d) => d !== dir);
  }

  releaseAll() {
    this.held = [];
    this.queued = [];
  }

  beginDrag(id: ActorId) {
    const actor = this.actors.get(id);
    if (!actor) return;
    if (id === this.walker) this.releaseAll();
    actor.dragging = true;
    actor.motion = null;
    actor.path = [];
    actor.seat = null;
    this.commit(actor);
    this.flush();
  }

  /** The dragged sprite's top-left, in stage px. */
  dragTo(id: ActorId, left: number, top: number) {
    const actor = this.actors.get(id);
    if (!actor?.dragging) return;
    const t = TILE * this.scale;
    actor.x = left / t;
    actor.y = (top + FRAME.h * this.scale) / t - 1;
    this.moved = true;
  }

  /** Drops a dragged character on the nearest free walkable tile and settles it there. */
  endDrag(id: ActorId) {
    const actor = this.actors.get(id);
    if (!actor?.dragging) return;
    actor.dragging = false;
    const taken = new Set<string>();
    for (const other of this.actors.values()) {
      if (other === actor) continue;
      taken.add(tileKey(other.tile));
      if (other.motion?.kind === "step" || other.motion?.kind === "settle") taken.add(tileKey(other.motion.to));
    }
    const to = nearestFree({ x: Math.round(actor.x), y: Math.round(actor.y) }, taken) ?? actor.tile;
    if (this.reduced) {
      this.land(actor, to);
      this.comeToRest(actor);
    } else {
      actor.motion = { kind: "settle", fx: actor.x, fy: actor.y, to, t0: performance.now() };
      this.commit(actor);
    }
    this.flush();
  }

  // The loop -----------------------------------------------------------------

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick);
    for (const actor of this.actors.values()) this.advance(actor, now);
    for (const actor of this.actors.values()) this.paint(actor, now);
    if (this.moved) {
      this.moved = false;
      for (const follower of this.followers) this.place(follower);
    }
    this.flush();
  };

  private repaint() {
    const now = performance.now();
    for (const actor of this.actors.values()) this.paint(actor, now);
    this.moved = false;
    for (const follower of this.followers) this.place(follower);
  }

  private advance(actor: Actor, now: number) {
    if (actor.dragging) return;
    const motion = actor.motion;
    if (motion?.kind === "settle") {
      const t = Math.min(1, (now - motion.t0) / SETTLE_MS);
      const e = settleEase(t);
      actor.x = motion.fx + (motion.to.x - motion.fx) * e;
      actor.y = motion.fy + (motion.to.y - motion.fy) * e;
      this.moved = true;
      if (t >= 1) {
        actor.motion = null;
        this.land(actor, motion.to);
        this.comeToRest(actor);
      }
      return;
    }
    if (motion?.kind === "step") {
      const t = Math.min(1, (now - motion.t0) / STEP_MS);
      if (!motion.jump) {
        actor.x = motion.from.x + (motion.to.x - motion.from.x) * t;
        actor.y = motion.from.y + (motion.to.y - motion.from.y) * t;
        this.moved = true;
      }
      if (t < 1) return;
      actor.motion = null;
      if (!motion.jump) this.land(actor, motion.to);
      // The next step starts where this one ended, on the same frame, so a
      // held key or a path walks without a stall between tiles.
      if (!this.next(actor, now)) this.comeToRest(actor);
      return;
    }
    // At rest: a held key (you) or a path set while standing still.
    if (this.next(actor, now)) return;
  }

  /** Starts the next step, from the queued or held key (you) or the path. False when there is none. */
  private next(actor: Actor, now: number): boolean {
    if (actor.id === this.walker) {
      const dir = this.queued.shift() ?? this.held[this.held.length - 1] ?? null;
      if (dir) {
        actor.path = [];
        const to = { x: actor.tile.x + DELTA[dir].x, y: actor.tile.y + DELTA[dir].y };
        if (isWalkable(to)) {
          this.beginStep(actor, to, now);
          return true;
        }
        // Against a wall or furniture: turn to face it, and stay.
        if (actor.facing !== dir) {
          actor.facing = dir;
          actor.seat = null;
          this.commit(actor);
        }
        return false;
      }
    }
    const to = actor.path.shift();
    if (!to) return false;
    this.beginStep(actor, to, now);
    return true;
  }

  private beginStep(actor: Actor, to: Tile, now: number) {
    const wasWalking = actor.motion?.kind === "step" || actor.walkStart > 0;
    actor.facing = facingOf(actor.tile, to, actor.facing);
    actor.seat = null;
    if (!wasWalking) actor.walkStart = now;
    const jump = this.reduced;
    actor.motion = { kind: "step", from: { ...actor.tile }, to, t0: now, jump };
    if (jump) this.land(actor, to);
    this.commit(actor);
  }

  private land(actor: Actor, to: Tile) {
    actor.x = to.x;
    actor.y = to.y;
    if (!same(actor.tile, to)) actor.tile = { ...to };
    this.moved = true;
    this.commit(actor);
  }

  private comeToRest(actor: Actor) {
    actor.walkStart = 0;
    const seat = seatAt(actor.tile);
    actor.seat = seat?.id ?? null;
    if (seat) actor.facing = seat.facing;
    this.commit(actor);
  }

  // Painting -----------------------------------------------------------------

  private paint(actor: Actor, now: number) {
    const root = actor.root;
    if (!root) return;
    const box = this.box(actor.id);
    if (!box) return;

    const transform = `translate3d(${box.left}px, ${box.top}px, 0)`;
    if (transform !== actor.written.transform) {
      root.style.transform = transform;
      actor.written.transform = transform;
    }
    const z = actor.dragging ? DRAG_Z : box.feet;
    if (z !== actor.written.z) {
      root.style.zIndex = String(z);
      actor.written.z = z;
    }

    const sprite = actor.sprite;
    if (!sprite) return;
    let pose: Pose = "idle";
    let step = 0;
    const motion = actor.motion;
    if (!actor.dragging && motion?.kind === "step" && !motion.jump) {
      pose = "walk";
      step = Math.floor((now - actor.walkStart) / FRAME_MS.walk);
    } else if (!actor.dragging && !motion) {
      const rest = this.rest(actor.id, seatOf(actor.seat));
      pose = rest.pose;
      if (rest.animate && !this.reduced) step = Math.floor((now + actor.phase) / FRAME_MS[pose]);
    }
    const frame = frameOf(pose, actor.facing, step);
    const key = `${frame.col},${frame.row},${frame.flip ? 1 : 0}`;
    if (key === actor.written.frame) return;
    actor.written.frame = key;
    sprite.style.backgroundPosition = framePosition(frame, this.scale);
    sprite.style.transform = frame.flip ? "scaleX(-1)" : "";
  }

  private place(follower: Follower) {
    const at = follower.anchor();
    if (!at) return;
    const transform = `translate3d(${Math.round(at.x)}px, ${Math.round(at.y)}px, 0)`;
    if (transform === follower.written) return;
    follower.el.style.transform = transform;
    follower.written = transform;
  }

  // Commits ------------------------------------------------------------------

  private snap(actor: Actor): ActorSnapshot {
    return {
      tile: { ...actor.tile },
      facing: actor.facing,
      seat: actor.seat,
      moving: actor.dragging || actor.motion !== null || actor.path.length > 0,
      dragging: actor.dragging,
    };
  }

  private commit(actor: Actor) {
    this.pending.add(actor.id);
  }

  private flush() {
    if (this.pending.size === 0) return;
    let next: Record<ActorId, ActorSnapshot> | null = null;
    for (const id of this.pending) {
      const actor = this.actors.get(id);
      if (!actor) continue;
      const before = this.snapshot[id];
      const after = this.snap(actor);
      if (
        before &&
        same(before.tile, after.tile) &&
        before.facing === after.facing &&
        before.seat === after.seat &&
        before.moving === after.moving &&
        before.dragging === after.dragging
      ) {
        continue;
      }
      next ??= { ...this.snapshot };
      next[id] = after;
    }
    this.pending.clear();
    if (!next) return;
    this.snapshot = next;
    for (const listener of this.listeners) listener();
  }
}
