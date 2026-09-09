"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { IconCheck, IconChevronRight, IconCircle } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

// Phase 2: brand menus. A 14px popover on the elevated surface with the glass
// shadow and a hairline ring instead of a border; 8px items with tint hover
// fills; enter at 140ms quart-out, leave at 90ms (docs/brand/design.md §5, §6,
// §8). Sub content is rendered inline (no portal), as on the site.

const CONTENT =
  "z-50 min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-xl bg-popover p-1.5 text-popover-foreground shadow-lg ring-1 ring-border-subtle duration-(--duration-enter) ease-out-quart data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-(--duration-exit) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";

const ITEM =
  "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden transition-[color,background-color] duration-(--duration-instant) ease-out focus:bg-tint-10 focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0";

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

// Hand focus to `el` without arming the focus ring, and report whether that
// worked. The browser decides :focus-visible from the input modality it last
// saw, and a menu is a keyboard-driven surface, so a plain `focus()` on close
// paints the ring even for someone who used the mouse. The `focusVisible`
// focus option is the one lever that overrides that decision. It is not in
// every engine, so the getter records whether the browser actually read it and
// the caller falls back rather than trusting it blindly.
function focusWithoutRing(el: HTMLElement | null) {
  if (!el) return false;
  let honoured = false;
  el.focus({
    preventScroll: true,
    get focusVisible() {
      honoured = true;
      return false;
    },
  });
  if (honoured && !el.matches(":focus-visible")) return true;
  el.blur();
  return false;
}

// Radix always pulls focus back to the trigger when a menu closes: its own
// `onCloseAutoFocus` calls `triggerRef.current?.focus()`. That restored focus
// paints the trigger's ring even when the menu was dismissed with the mouse,
// which is the stray highlight on the composer pills.
//
// A keyboard close (Escape, Enter on an item) keeps Radix's behaviour: focus
// returns to the trigger and the ring shows, because that person needs to see
// where focus went. A pointer close hands focus back to the trigger quietly, so
// the tab order stays where the user left it and no ring appears. If the engine
// does not support the quiet focus, `focusWithoutRing` leaves focus off the
// trigger instead: losing the tab position is the smaller failure of the two.
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ref,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onPointerDown,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  // Keyboard is the safe default: a close we cannot classify still restores
  // focus. Sub content renders inline (below), so a pointer press inside a
  // submenu bubbles to here and is classified too.
  const modality = React.useRef<"keyboard" | "pointer">("keyboard");
  // Radix labels the content with the trigger's id, so the trigger can be
  // resolved while the menu is open and used again once it is closing.
  const trigger = React.useRef<HTMLElement | null>(null);

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        ref={(node) => {
          if (node) {
            const id = node.getAttribute("aria-labelledby");
            trigger.current = id ? document.getElementById(id) : null;
          }
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          modality.current = "pointer";
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          modality.current = "keyboard";
        }}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event);
          modality.current = "keyboard";
        }}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event);
          modality.current = "pointer";
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          if (modality.current === "pointer") {
            // Preventing the default short-circuits Radix's own handler, the
            // one that focuses the trigger: composeEventHandlers runs the
            // consumer's handler first and skips its own once the default is
            // prevented (@radix-ui/primitive).
            event.preventDefault();
            focusWithoutRing(trigger.current);
          }
          modality.current = "keyboard";
        }}
        className={cn(
          CONTENT,
          "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        ITEM,
        "data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive",
        className,
      )}
      {...props}
    />
  );
}

// `indicator="none"` drops the left check gutter so the item can carry its own
// on-state (a switch on a roster row, a fill and a check on a chip) while the
// element keeps `role="menuitemcheckbox"`, `aria-checked` and the menu's roving
// focus. The default is the check gutter, so existing call sites are unchanged.
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  indicator = "check",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  indicator?: "check" | "none";
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(ITEM, indicator === "check" && "pr-2 pl-8", className)}
      checked={checked}
      {...props}
    >
      {indicator === "check" ? (
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <IconCheck className="size-4" aria-hidden="true" />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>
      ) : null}
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

// `indicator="none"` as on the checkbox item: the dot gutter goes and the item
// shows its own selected state, keeping `role="menuitemradio"` and `aria-checked`.
function DropdownMenuRadioItem({
  className,
  children,
  indicator = "dot",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  indicator?: "dot" | "none";
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(ITEM, indicator === "dot" && "pr-2 pl-8", className)}
      {...props}
    >
      {indicator === "dot" ? (
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <IconCircle className="size-2 fill-current" aria-hidden="true" />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>
      ) : null}
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-border-subtle", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        ITEM,
        "cursor-default data-[state=open]:bg-tint-10 data-[state=open]:text-foreground data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <IconChevronRight className="ml-auto size-4" aria-hidden="true" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        CONTENT,
        "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
