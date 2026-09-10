"use client";

import { useId, useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The email route. A real <form> so Enter submits from the field, a visible
// label (a placeholder alone disappears the moment someone types, and this is
// the one field on the page), and a line under it that says what Continue
// actually does. Nothing is sent anywhere: this repo is static mock data, so
// submit only stops the navigation.
//
// The field takes the same 6px corner and 40px height as the button stack
// above it, so the whole column is one shape.
//
// Continue overrides the primitive's disabled look locally: `opacity-50` on an
// ink pill is a mid-grey slab at this width, so the empty state is a quiet
// tint with third-tier text instead. Tokens only, and the primitive is
// untouched.
export function EmailForm({
  onBack,
  inputRef,
}: {
  onBack: () => void;
  inputRef: React.Ref<HTMLInputElement>;
}) {
  const fieldId = useId();
  const hintId = useId();
  const [email, setEmail] = useState("");

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        // No auth in this prototype; the field simply keeps its value.
        event.preventDefault();
      }}
    >
      <Label htmlFor={fieldId}>Email address</Label>
      <Input
        ref={inputRef}
        id={fieldId}
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="you@company.com"
        aria-describedby={hintId}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-1.5 h-10 rounded-sm px-3"
      />
      <p id={hintId} className="mt-2 text-xs text-foreground-low">
        We&rsquo;ll email you a link to finish signing up.
      </p>
      <Button
        type="submit"
        size="lg"
        shape="soft"
        className="mt-3 w-full disabled:bg-tint-15 disabled:text-foreground-low disabled:opacity-100"
        disabled={email.trim() === ""}
      >
        Continue
      </Button>
      <div className="mt-2.5 flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          shape="soft"
          className="text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <IconArrowLeft aria-hidden="true" />
          Back to sign-in options
        </Button>
      </div>
    </form>
  );
}
