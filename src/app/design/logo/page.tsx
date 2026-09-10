import type { Metadata } from "next";
import { LogoGallery } from "./_gallery/logo-gallery";

export const metadata: Metadata = { title: "Logo motion · Brand" };

// Motion studies for the mark that sits above the title on the signup page.
// Dark is the signup page's only theme, so this gallery forces it: the `.dark`
// wrapper below carries brand.css's dark token mapping, and
// `@custom-variant dark (&:is(.dark *))` (globals.css) makes `dark:` work for
// everything inside it. Nothing here is shipped UI - it is the place to
// compare the three variants before one is chosen.
export default function LogoMotionPage() {
  return (
    <div className="dark min-h-svh bg-(--background) text-(--foreground)">
      <LogoGallery />
    </div>
  );
}
