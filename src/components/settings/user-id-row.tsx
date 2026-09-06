"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { currentUser } from "@/lib/mock/user";

// Avatar · name · monospace user id · copy button, under the "Settings" title.
// Transcribed from docs/reference/pages/settings.html.
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
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        width={32}
        height={32}
        className="shrink-0 object-cover rounded-full size-8 text-sm"
        src={currentUser.avatarUrl}
      />
      <span className="min-w-0 break-all">{currentUser.name}</span>
      <span aria-hidden="true">·</span>
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 break-all font-mono text-xs">{currentUser.id}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" className="size-5" aria-label="Copy user ID" onClick={copy}>
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied" : "Copy user ID"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
