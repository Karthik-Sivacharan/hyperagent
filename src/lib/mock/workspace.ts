// The artifact workspace beside a thread: the desktop hyperagent.com opens to
// the right of the conversation once a thread has produced something (a
// document, an image). Ground truth:
// docs/reference/overlays/thread-workspace-carousel.html (2026-09-10).
//
// Static like the rest of src/lib/mock/. Two artifacts, the document selected,
// which is the state the capture was taken in. The document's words are mock
// copy written for this file, not the live document's.

/** One run of document copy: `**strong**` and `` `code` `` are the only marks. */
export type DocumentBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  /** A section nobody has filled in yet. The site sets it in italic; Geist has
   *  no italic and the brand forbids a synthesised one, so it drops a text tier instead. */
  | { kind: "placeholder"; text: string };

export type WorkspaceDocument = {
  /** The emoji the document carries in front of its title. */
  icon: string;
  title: string;
  description: string;
  sections: { heading: string; blocks: DocumentBlock[] }[];
};

type ArtifactBase = {
  id: string;
  /** The name on the card's label and in the dock tile's tooltip. */
  title: string;
  /** The dock tile's accessible name; longer than the title where the site's is. */
  tileLabel: string;
};

export type WorkspaceArtifact =
  | (ArtifactBase & {
      kind: "document";
      /** A project document is shared by every thread in the project. */
      scope: "thread" | "project";
      document: WorkspaceDocument;
    })
  | (ArtifactBase & {
      kind: "image";
      src: string;
      width: number;
      height: number;
    });

/**
 * The wallpaper is a picture, not skin, so it lives here as data: a flat base
 * and three soft colour fields (position and size in percent of the desktop,
 * painted in this order), plus the point the highlight sits on. Measured off
 * the live page, where it is the same on every thread
 * (docs/reference/pages/thread-detail.html carries the same numbers).
 */
export type Wallpaper = {
  base: string;
  fields: { top: number; left: number; size: number; color: string }[];
  highlight: { x: number; y: number };
};

export const DESKTOP_WALLPAPER: Wallpaper = {
  base: "rgb(183 172 180)",
  fields: [
    { top: 47.9318, left: 18.0468, size: 80.0588, color: "rgb(124 152 192)" },
    { top: 4.3426, left: -3.21305, size: 78.8039, color: "rgb(221 203 176)" },
    { top: 7.72561, left: 45.1662, size: 78.5686, color: "rgb(205 162 173)" },
  ],
  highlight: { x: 31.1323, y: 66.4015 },
};

const PROJECT_DOCUMENT: WorkspaceDocument = {
  icon: "📋",
  title: "Hyperagent Prototype",
  description: "Project document for Hyperagent Prototype",
  sections: [
    {
      heading: "Goals",
      blocks: [{ kind: "placeholder", text: "Define your project goals here." }],
    },
    {
      heading: "Critical Facts",
      blocks: [
        {
          kind: "paragraph",
          text: "**Repo:** `Karthik-Sivacharan/hyperagent`, private, TypeScript, one branch `main`. A static clone of the hyperagent.com dashboard in the brand design language: no backend, no auth, every screen reads from `src/lib/mock/`.",
        },
        {
          kind: "paragraph",
          text: "**Stack:** Next 16 on the App Router, React 19, Tailwind v4, shadcn primitives over `radix-ui` and `cmdk`, `next-themes`, `@tabler/icons-react` (lucide is banned and a test holds the line), vitest 4.",
        },
        {
          kind: "paragraph",
          text: "**Component tiers** under `src/components/`: `ui/` primitives, the only place `radix-ui` and `cmdk` are imported, each carrying a `data-slot`; `patterns/` for what two pages share; the shell in `app/` and `composer/`; one directory per page. Pages hold no raw `button`, `input`, `textarea`, `select` or `label`.",
        },
      ],
    },
    {
      heading: "Research & Findings",
      blocks: [
        {
          kind: "list",
          items: [
            "The live dashboard runs Next.js, Tailwind v4 and shadcn over radix, so its class strings compile unchanged here.",
            "Once a thread produces something, a desktop opens beside it: wallpaper, glass controls and a dock of artifacts.",
          ],
        },
      ],
    },
    {
      heading: "Decisions",
      blocks: [
        {
          kind: "list",
          items: [
            "Keep the layout, change the skin. Where the two disagree, the brand wins.",
            "Geist and Geist Mono only, headings at 600.",
            "Tabler icons only.",
          ],
        },
      ],
    },
    {
      heading: "Tasks",
      blocks: [
        {
          kind: "list",
          items: [
            "Bring the workspace into the signup handoff.",
            "Add the Tile and Windows views.",
            "Stream an assistant turn once the shell arrives.",
          ],
        },
      ],
    },
    {
      heading: "Notes",
      blocks: [{ kind: "placeholder", text: "Add notes as the project moves." }],
    },
  ],
};

export const WORKSPACE_ARTIFACTS: WorkspaceArtifact[] = [
  {
    kind: "document",
    id: "doc-project",
    title: "Hyperagent Prototype",
    tileLabel: "Hyperagent Prototype, project-wide document: edits sync to every thread in this project",
    scope: "project",
    document: PROJECT_DOCUMENT,
  },
  {
    kind: "image",
    id: "img-signup",
    title: "Signup page, email pre-filled, awaiting your action",
    tileLabel: "Signup page, email pre-filled, awaiting your action",
    src: "/img/workspace/browser-capture.svg",
    width: 1280,
    height: 800,
  },
];

/** The artifact in focus: its card carries the selection ring, its tile the dot. */
export const WORKSPACE_ACTIVE_ID = "doc-project";

// The signup handoff's computer: the project document for the agent the demo
// sets up (Design system drift, agent-config.ts), in the site's project
// template. It keeps the agent stream's honesty rule (agent-stream.ts):
// nothing is connected at signup, so the document says what the agent WILL
// do and leaves Findings empty rather than claiming it has read a repo or a
// Figma file. No em dashes anywhere a reader sees.
const DRIFT_DOCUMENT: WorkspaceDocument = {
  icon: "📋",
  title: "Design system drift",
  description: "Project document for Design system drift",
  sections: [
    {
      heading: "Goals",
      blocks: [
        {
          kind: "paragraph",
          text: "Keep Trainwell's member app in step with the Figma library. After every merge to `main`, compare the front-end changes against the library and file what drifted, one issue per component, before it reaches members.",
        },
      ],
    },
    {
      heading: "Critical Facts",
      blocks: [
        {
          kind: "paragraph",
          text: "**Repo:** `trainwell/member-app`, reviewed on every merge to `main`.",
        },
        {
          kind: "paragraph",
          text: "**Source of truth:** the Figma library. Where the code and the library disagree, the library wins until a designer says otherwise.",
        },
        {
          kind: "paragraph",
          text: "**Works from** Figma and GitHub and **files to** Linear, with the Figma node and the PR line side by side. All three are under Connectors in the panel.",
        },
      ],
    },
    {
      heading: "Research & Findings",
      blocks: [{ kind: "placeholder", text: "Drift findings land here after the first run." }],
    },
    {
      heading: "Decisions",
      blocks: [
        {
          kind: "list",
          items: [
            "One issue per component, not one per PR, so a component that drifts twice is one conversation.",
            "Tokens first: a raw colour or spacing value where a token exists is drift, even when it looks right.",
            "Confirm before it writes: nothing is filed without a yes until the first week's issues are reviewed.",
          ],
        },
      ],
    },
    {
      heading: "Tasks",
      blocks: [
        {
          kind: "list",
          items: [
            "Pick the skills it starts with.",
            "Connect Linear so it can file issues.",
            "Review the first run's issues and tune the instructions.",
          ],
        },
      ],
    },
    {
      heading: "Notes",
      blocks: [{ kind: "placeholder", text: "Add notes as the agent learns the library." }],
    },
  ],
};

export const SIGNUP_WORKSPACE_ARTIFACTS: WorkspaceArtifact[] = [
  {
    kind: "document",
    id: "doc-drift",
    title: "Design system drift",
    tileLabel: "Design system drift, project-wide document: edits sync to every thread in this project",
    scope: "project",
    document: DRIFT_DOCUMENT,
  },
  // The second card is still the drawn signup capture from the set above.
  WORKSPACE_ARTIFACTS[1],
];

export const SIGNUP_WORKSPACE_ACTIVE_ID = "doc-drift";
