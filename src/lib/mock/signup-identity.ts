// What the signup screen "learns" about you when you pick an identity
// provider. Static, like every other file in this directory: there is no auth
// in this repo, so the Google button waits out a plausible delay and then
// resolves to exactly this record.
//
// The split is the one a real implementation would have, and it is worth
// keeping visible because the two halves cost very different things:
//
//   `person`  — free. Google's ID token already carries `given_name`,
//               `family_name`, `email` and `picture`, so the name, the address
//               and the photo need no lookup at all. Only `role` is invented
//               here; a real flow would either ask for it or enrich for it.
//
//   `company` — not free. The ID token's `hd` claim gives the Workspace
//               domain and nothing else, so everything below it (name, logo,
//               description, tags) comes from an enrichment call keyed on that
//               domain. It is also the half that can come back empty, which is
//               why the card that renders it is editable and why the screen
//               reads as a draft to confirm rather than a fact.
//
// The avatar is a real file in `public/avatars/`, standing in for the `picture`
// URL Google returns.

export type SignupPerson = {
  firstName: string;
  lastName: string;
  /** Stands in for the ID token's `picture`. */
  avatarSrc: string;
  email: string;
  /** The one field on this half a real ID token would not hand you. */
  role: string;
};

export type SignupCompany = {
  name: string;
  /** The ID token's `hd` claim: the whole enrichment lookup keys on this. */
  domain: string;
  /** Two lines at the card's measure, so it clamps rather than pushes. */
  description: string;
  /** Three at most: a fourth wraps the row at the column's 384px. */
  tags: string[];
  /** Square mark in `public/logos/`. See the note on where it came from. */
  logoSrc: string;
};

export const SIGNUP_PERSON: SignupPerson = {
  firstName: "Karthik",
  lastName: "Sivacharan",
  avatarSrc: "/avatars/karthik.jpg",
  email: "karthik@trainwell.net",
  role: "Design Engineer",
};

// Read off trainwell.net on 2026-09-09: the description is the About page's
// own framing, the tags are the categories the site sells itself in, and the
// mark is their apple-touch-icon, untouched — the 256x256 PNG their site
// serves at `train-icon-256x256.png`, byte for byte.
//
// It was the leading "t" cropped out of that icon first, on the argument that
// a wide wordmark is illegible at the 48px the company card gives it. The
// wordmark is what the company actually looks like, though, and a letter
// nobody outside the building would recognise is not a saving. Kept at
// `/logos/trainwell-mark.png` if the small sizes ever need it back.
export const SIGNUP_COMPANY: SignupCompany = {
  name: "Trainwell",
  domain: "trainwell.net",
  description: "Remote personal training with a real human coach, delivered through an app.",
  tags: ["Fitness", "Consumer app", "Remote coaching"],
  logoSrc: "/logos/trainwell.png",
};

/** `Karthik Sivacharan`. Used by the card title and the welcome heading. */
export const signupFullName = `${SIGNUP_PERSON.firstName} ${SIGNUP_PERSON.lastName}`;

/** `KS`. The avatar's fallback while the photo loads, or if it 404s. */
export const signupInitials = `${SIGNUP_PERSON.firstName[0]}${SIGNUP_PERSON.lastName[0]}`;
