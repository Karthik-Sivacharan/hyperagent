// What every colour in the six Pixel Agents character sheets
// (scripts/space/sprites-source/char_0..5.png, MIT) is part of, read off the
// frames one by one. make-agent-sprites.mjs uses it to turn a person into a
// robot: hair becomes the helmet, skin becomes metal, eyes become the visor,
// clothes take the agent's hue, shoes go dark steel and the reading prop (a
// paper held in both hands) is left alone.
//
// Roles: hair, skin, skinline (the dark line round the face and hands), eye,
// cloth, clothline (the clothes' outer line), shoe, prop. A few colours mean
// different things in different places, so an entry can list several roles
// joined by "|", tried in order: `prop` holds inside the frame's prop box (the
// bounding box of the paper's outline colour, 391624), `eye` holds above the
// frame's neck line, and the last role always holds. White is the usual case:
// an eye white in the head, the paper in the hands, a shirt everywhere else.
//
// An unknown colour is an error, so a changed source sheet cannot slip
// through unclassified.

const PROP = { "391624": "prop", e1e3e9: "prop", a2aaaf: "prop" };

/** @type {Record<number, Record<string, string>>} */
export const ROLES = {
  // Brown side-parted hair, blue suit over a white shirt, dark tie.
  0: {
    ...PROP,
    "8f6439": "hair", "32191d": "hair", "6d4726": "hair", "6f4a2a": "hair", "341f20": "hair", b18649: "hair",
    e9a384: "skin", fbbf97: "skin", e29878: "skin", c5896e: "skin", ffd8b2: "skin", "84523a": "skin",
    "493e38": "skinline", "352c27": "skinline", "403632": "skinline",
    "000000": "eye|shoe", "4f4f4f": "eye|shoe", "191919": "eye|shoe", "595959": "eye|shoe",
    ffffff: "prop|eye|cloth",
    "1164a9": "cloth", "114978": "cloth", "0f406a": "cloth", "040605": "cloth", "9f9f9f": "cloth",
    "071c2e": "clothline",
    "353535": "shoe", "1a1a1a": "shoe",
  },
  // Long fair hair to the shoulders, black dress, bare legs.
  1: {
    ...PROP,
    "7e4b29": "hair", be7743: "hair", e39f5a: "hair", f1c084: "hair",
    e9a384: "skin", fbbf97: "skin", e29878: "skin", ffd8b2: "skin", bd8068: "skin", c5896e: "skin",
    "493e38": "skinline", "5e514c": "skinline",
    "000000": "eye|clothline", "4f4f4f": "eye|clothline", "191919": "eye|clothline", "595959": "eye|clothline",
    ffffff: "prop|eye|cloth",
    "252525": "cloth", "2b2b2b": "cloth", "1a1a1a": "cloth",
    "101010": "clothline",
  },
  // Round dark hair, orange shirt with red sleeves, navy trousers, white soles.
  2: {
    ...PROP,
    "181616": "hair", "221e1e": "hair", "1b1a19": "hair", "282423": "hair", "2b2827": "hair", "252120": "hair",
    "5f4132": "skin", "493227": "skin", "75503d": "skin", "865e4c": "skin", "593b2c": "skin", "84523a": "skin",
    "231e1d": "skinline", "352c27": "skinline", "403632": "skinline",
    "000000": "eye|shoe", "4f4f4f": "eye|shoe", "191919": "eye|shoe",
    ffffff: "prop|eye|cloth",
    f67d20: "cloth", e8741b: "cloth", e87218: "cloth", e1721d: "cloth", ff8b31: "cloth",
    "8b1a16": "cloth", a91d18: "cloth", "741713": "cloth", "343d5a": "cloth", "49557e": "cloth", "23294d": "cloth",
    "56110e": "clothline", "592700": "clothline", "111528": "clothline",
    "120308": "shoe", d0d0d0: "shoe", "595959": "shoe", fff2ec: "shoe",
  },
  // Full white hair, pale shirt, khaki shorts, bare legs.
  3: {
    ...PROP,
    b0a6a3: "hair", daccc9: "hair", bfb6b3: "hair", f0e1de: "hair", fff1ef: "hair", e9d7d4: "hair",
    b67352: "skin", "8c583f": "skin", ac6847: "skin", e08d64: "skin", ffa77c: "skin", "84523a": "skin", fff2ec: "skin",
    "423732": "skinline", "352c27": "skinline", "403632": "skinline",
    "000000": "eye|skinline", "4f4f4f": "eye|skinline", "191919": "eye|skinline", "595959": "eye|skinline",
    ffffff: "prop|eye|cloth",
    d4d4d4: "cloth", eeeeee: "cloth", bdbdbd: "cloth", d2b48e: "cloth", "796064": "cloth", ac9082: "cloth",
    "4c4c4c": "clothline", "3c314f": "clothline",
  },
  // Spiky brown hair (two spikes on top), white shirt, belt, blue jeans.
  4: {
    ...PROP,
    "432415": "hair", "2f160f": "hair", "57351a": "hair", "69451b": "hair", "421b19": "hair", "442414": "hair",
    e9a384: "skin", c5896e: "skin", e29878: "skin", fbbf97: "skin", ffd8b2: "skin", bd8068: "skin",
    "493e38": "skinline", "352c27": "skinline", "5e514c": "skinline",
    "000000": "eye|shoe", "4f4f4f": "eye|shoe", "191919": "eye|shoe", "595959": "eye|shoe",
    ffffff: "prop|eye|cloth",
    d4d4d4: "cloth", eeeeee: "cloth", bdbdbd: "cloth", "0b100c": "cloth", "114978": "cloth", "0f406a": "cloth",
    "4c4c4c": "clothline", "071c2e": "clothline",
    "353535": "shoe", "1a1a1a": "shoe",
  },
  // Black bob with a fringe, red top, dark skirt, bare legs.
  5: {
    ...PROP,
    "202020": "hair", "0e0e0e": "hair", "303030": "hair", "373737": "hair", "414141": "hair", "282828": "hair", "131313": "hair",
    fcd6c4: "skin", e1aa91: "skin", cf9d86: "skin", ffede5: "skin", ba917e: "skin", fff6f2: "skin", ffe0d2: "skin",
    b0886c: "skin", c1a496: "skin", c4a68e: "skin", cab3a9: "skin", b48d7c: "skin", ad8572: "skin",
    "705e56": "skinline", "594b45": "skinline", "454545": "skinline", "403632": "skinline", "564842": "skinline", "5f4f3f": "skinline",
    "000000": "eye|shoe", "4f4f4f": "eye|shoe", "191919": "eye|shoe",
    ffffff: "prop|eye|cloth",
    b24737: "cloth", e16451: "cloth", "9f3f31": "cloth", "332c23": "cloth", "1d1718": "cloth", "2a2320": "cloth",
    "640026": "clothline", "0f0c13": "clothline",
    "595959": "shoe", fff2ec: "shoe",
  },
};
