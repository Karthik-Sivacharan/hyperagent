"use client";

import { useState, useSyncExternalStore, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconMoon, IconSun } from "@tabler/icons-react";

import { FloorCanvas } from "@/components/teams/space/world/floor-canvas";
import { FurnitureLayer } from "@/components/teams/space/world/furniture-layer";
import {
  COLS,
  DOORS,
  MAP_H,
  MAP_W,
  ROOMS,
  ROWS,
  SEATS,
  TILE,
  isWalkable,
} from "@/components/teams/space/world/map";
import { RoomLabels } from "@/components/teams/space/world/room-labels";
import { AWAY_DESKS, SEED } from "@/components/teams/space/world/seed";
import type { Facing, Placement } from "@/components/teams/space/types";
import { Label } from "@/components/ui/label";
import { Overline } from "@/components/ui/overline";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

// The office's art layers on their own (src/components/teams/space/world/),
// at the 2x the /teams office view draws them at 1456 x 868: the baked floor
// canvas, the furniture sprites and the room signs. The debug overlay shows
// what the actors walk on: walkable tiles, room rects, doors, seats with the
// way they face, and where everyone starts. The stand-in characters are
// drawn straight from the sheets in public/space/characters/ at their seed,
// seated ones lowered as Pixel Agents lowers them, only to judge how desks
// and chairs overlap people; the real ones live in the office view.

const SCALE = 2;
const px = (n: number) => n * TILE * SCALE;

const FACING_ICON: Record<Facing, typeof IconArrowUp> = {
  up: IconArrowUp,
  down: IconArrowDown,
  left: IconArrowLeft,
  right: IconArrowRight,
};

// Pixel Agents' sheet layout: 7 columns x 3 rows of 16 x 32 frames; rows face
// down, up, right (left mirrors right); column 1 stands, 3 types.
const FRAME_ROW: Record<Facing, number> = { down: 0, up: 1, right: 2, left: 2 };

function sheetUrl(id: string): string {
  return `/space/characters/${id.startsWith("m-") ? "member" : "agent"}-${id}.png`;
}

function StandIn({ id, placement }: { id: string; placement: Placement }) {
  const seated = Boolean(placement.seat);
  const { tile, facing } = placement;
  const style: CSSProperties = {
    left: tile.x * TILE * SCALE,
    top: (tile.y * TILE + TILE / 2 + (seated ? 6 : 0) - 32) * SCALE,
    width: 16 * SCALE,
    height: 32 * SCALE,
    zIndex: (tile.y + 1) * TILE * SCALE,
    backgroundImage: `url(${sheetUrl(id)})`,
    backgroundSize: `${112 * SCALE}px ${96 * SCALE}px`,
    backgroundPosition: `${-(seated ? 3 : 1) * 16 * SCALE}px ${-FRAME_ROW[facing] * 32 * SCALE}px`,
    transform: facing === "left" ? "scaleX(-1)" : undefined,
  };
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute block bg-no-repeat [image-rendering:pixelated]"
      style={style}
    />
  );
}

function DebugOverlay() {
  const seedTiles = Object.entries(SEED);
  const away = new Set(AWAY_DESKS.map((d) => d.seat));
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-5000">
      {Array.from({ length: ROWS }, (_, y) =>
        Array.from({ length: COLS }, (_, x) =>
          isWalkable({ x, y }) ? (
            <span
              key={`w${x},${y}`}
              className="absolute border border-info/25 bg-info/10"
              style={{ left: px(x), top: px(y), width: px(1), height: px(1) }}
            />
          ) : null,
        ),
      )}
      {ROOMS.map((r) => (
        <span
          key={r.id}
          className="absolute border-2 border-foreground/55 border-dashed"
          style={{ left: px(r.x), top: px(r.y), width: px(r.w), height: px(r.h) }}
        >
          <span className="absolute top-0.5 left-0.5 rounded-sm bg-foreground px-1 font-medium text-background text-xs">
            {r.id}
          </span>
        </span>
      ))}
      {DOORS.flatMap((d) =>
        d.tiles.map((t) => (
          <span
            key={`d${t.x},${t.y}`}
            className="absolute bg-warning/35"
            style={{ left: px(t.x), top: px(t.y), width: px(1), height: px(1) }}
          />
        )),
      )}
      {SEATS.map((s) => {
        const Icon = FACING_ICON[s.facing];
        return (
          <span
            key={s.id}
            title={s.id}
            className={cn(
              "absolute flex items-center justify-center rounded-full border-2",
              away.has(s.id) ? "border-warning bg-warning/30" : "border-success bg-success/30",
            )}
            style={{ left: px(s.tile.x) + 6, top: px(s.tile.y) + 6, width: px(1) - 12, height: px(1) - 12 }}
          >
            <Icon className="size-3 text-foreground" aria-hidden="true" />
          </span>
        );
      })}
      {seedTiles.map(([id, p]) => (
        <span
          key={id}
          className="absolute border-2 border-destructive"
          style={{ left: px(p.tile.x), top: px(p.tile.y), width: px(1), height: px(1) }}
        >
          <span className="absolute -bottom-4 left-0 whitespace-nowrap rounded-sm bg-destructive px-0.5 font-medium text-destructive-foreground text-xs leading-4">
            {id.slice(2)}
          </span>
        </span>
      ))}
    </div>
  );
}

const subscribeNever = () => () => {};

// The app theme (next-themes on <html>), so the art is judged in the mapping
// it ships in.
function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  return (
    <ToggleGroup
      type="single"
      spacing={0}
      aria-label="Theme"
      value={mounted ? (resolvedTheme ?? "") : ""}
      onValueChange={(value) => value && setTheme(value)}
    >
      <ToggleGroupItem value="light" className="gap-1.5">
        <IconSun aria-hidden="true" />
        Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" className="gap-1.5">
        <IconMoon aria-hidden="true" />
        Dark
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}

export default function SpaceDesignPage() {
  const [debug, setDebug] = useState(false);
  const [people, setPeople] = useState(true);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-8 py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Overline>Teams · office</Overline>
            <h1 className="font-heading text-2xl">Office map</h1>
            <p className="max-w-content text-muted-foreground text-sm">
              The world layers of the /teams office at 2x: the baked floor, rug and wall canvas, the furniture
              sprites sorted by their bottom edge, and the room signs by each door. Turn on the grid to see where
              people can walk, the rooms, the doors, every seat and the way it faces, and where everyone starts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Toggle id="space-people" label="Characters" checked={people} onChange={setPeople} />
            <Toggle id="space-debug" label="Grid" checked={debug} onChange={setDebug} />
            <ThemeSwitch />
          </div>
        </header>

        <div className="overflow-x-auto">
          <div
            className="relative mx-auto overflow-hidden rounded-xl shadow-card"
            style={{ width: MAP_W * SCALE, height: MAP_H * SCALE }}
          >
            <FloorCanvas scale={SCALE} />
            <FurnitureLayer scale={SCALE} />
            <RoomLabels scale={SCALE} />
            {people && Object.entries(SEED).map(([id, p]) => <StandIn key={id} id={id} placement={p} />)}
            {debug && <DebugOverlay />}
          </div>
        </div>
      </div>
    </div>
  );
}
