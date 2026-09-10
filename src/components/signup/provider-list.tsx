import { IconMail } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { AppleMark, GoogleMark, MicrosoftMark } from "@/components/signup/provider-marks";

// The three identity providers, then the quieter email route. Each provider
// is a filled row at the full width of the column with its mark and label
// centred together as one unit, so the row reads as a single target rather
// than a label with a gutter. The fill is the tint ramp — `variant="tint"` is
// exactly the documented `bg-tint-10` rest and `hover:bg-tint-15` hover
// (docs/brand/reskin-conventions.md, "fills are tints"), which needs no
// `dark:` variant because the ramp is defined per theme. That variant carries
// `text-muted-foreground` because it was built as a toolbar pill; an auth
// button's label belongs on the first tier, so `text-foreground` overrides it
// through the documented escape hatch of a local class (cn() merges last).
// Their edge stays `border-input`, the same tint-20 hairline the email field
// wears, so swapping one block for the other does not change the weight of
// the shape. The email row is a ghost row sized to its own text: the same
// 40px height, a third of the visual weight.
//
// Shape and height come from the reference auth stack: `shape="soft"` is the
// 6px corner (the reference's own radius, measured), `size="lg"` the 40px
// height taken from the reference "Continue with email" CTA.
//
// Only Google is wired to anything. There is no auth in this repo, so the other
// two rows stay inert exactly as the email form's submit does — and Google is
// the one the demo needs, because the record the next screen shows is the one
// a Google ID token plus a domain lookup would actually produce.
const PROVIDERS = [
  { id: "google", label: "Sign in with Google", mark: <GoogleMark className="size-4.5" /> },
  { id: "apple", label: "Sign in with Apple", mark: <AppleMark className="size-5" /> },
  { id: "microsoft", label: "Sign in with Microsoft", mark: <MicrosoftMark className="size-4.5" /> },
];

export function ProviderList({
  onChooseEmail,
  emailButtonRef,
  onSelectGoogle,
}: {
  onChooseEmail: () => void;
  emailButtonRef: React.Ref<HTMLButtonElement>;
  onSelectGoogle: () => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="tint"
          size="lg"
          shape="soft"
          className="w-full border border-input text-foreground"
          onClick={provider.id === "google" ? onSelectGoogle : undefined}
        >
          {provider.mark}
          {provider.label}
        </Button>
      ))}
      <div className="mt-0.5 flex justify-center">
        <Button
          ref={emailButtonRef}
          type="button"
          variant="ghost"
          size="lg"
          shape="soft"
          className="text-muted-foreground hover:text-foreground"
          onClick={onChooseEmail}
        >
          <IconMail aria-hidden="true" />
          Continue with email
        </Button>
      </div>
    </div>
  );
}
