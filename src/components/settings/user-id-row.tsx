"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { currentUser } from "@/lib/mock/user";

// Avatar · name · monospace user id · copy button, under the "Settings" title.
// Transcribed from docs/reference/pages/settings.html. Phase 2: the name is
// the voice (tier 1), the id is provenance in the brand's 12px mono on tier 3,
// and the copy control is a ghost icon pill (docs/brand/design.md §4.1).
export function UserIdRow() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied; the button simply does nothing then.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-full object-cover text-sm"
        src={currentUser.avatarUrl}
      />
      <span className="min-w-0 break-all text-foreground">{currentUser.name}</span>
      <span aria-hidden="true" className="text-foreground-low">
        ·
      </span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 break-all text-label-12-mono text-foreground-low">{currentUser.id}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-5 text-foreground-low hover:text-foreground"
              aria-label="Copy user ID"
              onClick={copy}
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied" : "Copy user ID"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
