# Smear gradients

Reverse-engineering the two motion-blurred gradient frames in
`~/Documents/.../Image-Gen/Gradients` (kept out of git), and rebuilding them
from parameters.

This is an experiment branch, not part of the app. Nothing here is imported by
`src/`, and `npm test` does not look at it (`vitest.config.mts` only includes
`src/**/*.test.ts`).

```
experiments/smear-gradients/
  README.md            this file
  palettes.mjs         the 12 ramps + the OKLCH recipe they come from
  smear-gradient.mjs   CPU generator -> PNG (culori + sharp, both already deps)
  studio.html          live WebGL version with every parameter on a slider
  preview/             committed WebP of all 12 — look here first
  output/              full-size PNGs (git-ignored; 16MB, regenerate on demand)
```

**Just want to see them?** `experiments/smear-gradients/preview/` is in the repo:
twelve 1024x768 WebP plus `contact-sheet.webp` with all of them side by side. No
need to run anything.

WebP at q92 rather than PNG because the PNGs total 16MB against a 26MB repo,
and q92 holds ~95% of the grain amplitude at 35KB a frame. Anything lossier eats
the grain, which is most of what makes these look like photographs of light
rather than vector art.

Run it:

```bash
node experiments/smear-gradients/palettes.mjs                 # list the 12 ramps
node experiments/smear-gradients/smear-gradient.mjs           # render all of them
node experiments/smear-gradients/smear-gradient.mjs --sheet   # one contact sheet
node experiments/smear-gradients/smear-gradient.mjs --preview # refresh preview/
node experiments/smear-gradients/smear-gradient.mjs iris 2560 1440
open experiments/smear-gradients/studio.html                  # the live one
```

---

## The short answer

Neither frame is a gradient in the CSS sense. Both are **one scalar noise field,
smeared along one axis, read through one colour ramp**:

```
rgb(x, y) = ramp( softclip( blur_θ( fbm_θ(x, y) ) + linear_θ(x, y) ) ) + grain_θ
```

The giveaway is that colour has essentially one degree of freedom. Principal
components on the raw pixels put **88.6%** (blue frame) and **89.8%** (orange
frame) of all colour variance on PC1, and the mean residual off the best-fit 1-D
colour *curve* is **9.1/255** and **10.9/255**. Every pixel in either image is a
point on a single curve through colour space. A mesh gradient, a blob gradient
or a stack of overlapping radial gradients would not do that.

The second giveaway is the texture. The fine grain is **8.3×** and **13.9×**
longer along the streak axis than across it. Noise that directional is not
painted — it has been through a directional blur.

## What the numbers say

| Measurement | Blue / pink | Orange | Reading |
|---|---|---|---|
| Streak axis | **16.5°** | **25.0°** | below horizontal, descending to the right |
| Grain anisotropy | 8.3× | 13.9× | fine noise is smeared, not painted |
| Anisotropy @ 2 px | 9.3× | 7.0× | |
| Anisotropy @ 12 px | 3.6× | 4.5× | |
| Anisotropy @ 50 px | 1.5× | 3.3× | falls with scale → fixed-length blur |
| Blur length | ≈180 px | ≈157 px | on a 1024 px frame: 15–18% of the width |
| PC1 of colour | 88.6% | 89.8% | one ramp, not a palette |
| Residual off the ramp | 9.1/255 | 10.9/255 | confirms the 1-D curve |
| OKLCH L | 0.281 → 0.927 | 0.268 → 0.798 | the orange never reaches a true white |
| OKLCH C | peak 0.145 @ t=0.31 | peak 0.194 @ t=0.82 | early peak reads as sky, late as heat |
| OKLCH H | 258° → 343° (span 108°) | 23° → 65° (span 42°) | blue→lilac→blush vs umber→amber |
| Grain amplitude | 0.95/255 | 1.08/255 | below one 8-bit step |
| Unique colours | 74,667 | 69,767 | no banding; both are dithered |
| Fit to a plain linear gradient | 33.7% | 2.8% | the orange is almost pure noise |

### The anisotropy is the load-bearing number

Correlation length along vs across the streaks, per bandpass scale:

| scale | blue along/across | orange along/across |
|---|---|---|
| 1 px | 8.0× | 8.5× |
| 3 px | 8.0× | 5.9× |
| 8 px | 3.5× | 4.7× |
| 20 px | 3.1× | 3.7× |
| 50 px | 1.5× | 3.3× |

The ratio **falls** as the features get bigger, and the along-streak correlation
length saturates near 180 px. That is the signature of a **fixed-length blur**:
anything much shorter than the kernel is wiped out along the axis, anything much
longer than it survives roughly round. A domain that were merely stretched would
hold the same ratio at every scale.

### The ramps

Sampled at 11 stops, `t = 0` at the dark end. These are what `smear-gradient.mjs`
ships as `PRESETS`.

**Blue / pink** — `#022758 #084382 #0f61ab #1981cc #2d99de #4fa4e5 #73aaea #97b0ee #babbf2 #e1c3ee #fddcef`

Hue runs 258° → 242° → 343°: it darkens *through* blue, then swings to lilac and
blush while chroma collapses from 0.145 to 0.044. The pink is not a second
colour, it is the desaturated bright end of the same curve.

**Orange** — `#33201f #492924 #5f312b #773228 #8d3b30 #a43e30 #bc422e #d3472c #e7542b #f7702c #fea746`

Hue barely moves (23° → 65°, and most of that swing is in the last two stops).
Chroma peaks *late*, at t = 0.82, which is what reads as heat: the brightest part
is also the most saturated, right up until the amber tip.

Interpolate these in **OKLab**. In sRGB the same stops sag grey through the
middle wherever the hue crosses.

## The five pieces

1. **Anisotropic fBm.** Value noise sampled on a domain rotated to θ and 5–8×
   coarser along the streak axis than across it. Stretch alone gives soft blobs.
2. **Directional blur.** Box average along θ, 15–20% of the long edge. Blur
   alone gives a flat smear. Stretch *and* blur give streaks.
3. **Linear bias.** A plain ramp across the streak axis, mixed in. The blue frame
   leans on it (34% — hence its single top-left-to-bottom-right sweep); the
   orange frame barely uses it (3%), so its bands are pure noise.
4. **The ramp**, sampled continuously in OKLab.
5. **Smeared grain.** White noise box-averaged along the same θ, added in linear
   light at ~1/255, then triangular dither. This is what separates the result
   from vector art; without it the output measures as a flat 2-D gradient.

## Reproduction

`smear-gradient.mjs` against the originals, same measurements:

| metric | blue original | `dusk` | orange original | `ember` |
|---|---|---|---|---|
| streak angle | 16.5° | 16.2° | 25.0° | 24.5° |
| grain anisotropy | 8.3× | 6.0× | 13.9× | 14.5× |
| PC1 | 88.6% | 91.3% | 89.8% | 92.7% |
| OKL p01 → p99 | 0.301 → 0.909 | 0.307 → 0.906 | 0.283 → 0.738 | 0.296 → 0.759 |
| OKC p99 | 0.149 | 0.151 | 0.202 | 0.212 |
| mean hue | 256.8° | 262.2° | 33.5° | 35.3° |

Composition differs by seed — the point is that the *method* reproduces the look,
not that a given frame is matched pixel for pixel.

## The twelve ramps

`dusk` and `ember` carry literal stops sampled off the reference frames. The other
ten are generated from one OKLCH recipe in `palettes.mjs`, so the set reads as a
family rather than as ten unrelated pictures:

- **L(t)** climbs a shared range, roughly 0.26 → 0.90, dark at `t = 0`
- **C(t)** rides one bump envelope — low at both ends, peaking in the middle.
  Sliding the peak is what separates a sky (peaks early, bright end goes pale)
  from a fire (peaks late, bright end stays hot)
- **H(t)** travels 40–100° along the short arc. Hue travel is the family
  signature, not decoration: a ramp that holds one hue and only lightens reads
  as a plain tint

Chroma is clamped into sRGB per stop, so a hue path that leaves the gamut loses
saturation instead of clipping to a wall of primary. Cyan pays for this —
`lagoon` and `glacier` cap near C 0.11 where the rest reach 0.15–0.18, because
sRGB simply has no room at those hues and lightnesses.

| name | story | angle | L | C max @ | hue travel |
|---|---|---|---|---|---|
| dusk | navy → azure → lilac → blush *(measured)* | 16.5° | 0.28→0.93 | 0.144 @ 0.30 | 257→342 (85°) |
| ember | umber → vermilion → amber *(measured)* | 25° | 0.27→0.80 | 0.190 @ 0.80 | 23→65 (43°) |
| moss | pine → fern → chartreuse | 19° | 0.27→0.90 | 0.154 @ 0.60 | 167→108 (60°) |
| lagoon | deep sea → teal → aqua | 22° | 0.26→0.88 | 0.109 @ 0.60 | 217→172 (45°) |
| iris | violet ink → indigo → periwinkle | 17° | 0.26→0.92 | 0.168 @ 0.40 | 298→251 (48°) |
| orchid | aubergine → orchid → blush | 20° | 0.27→0.93 | 0.164 @ 0.50 | 313→358 (45°) |
| rosewood | oxblood → rose → apricot | 24° | 0.26→0.90 | 0.176 @ 0.70 | 351→30 (39°) |
| bronze | bitumen → bronze → straw | 23° | 0.27→0.89 | 0.150 @ 0.70 | 36→88 (52°) |
| cypress | forest → olive → lime | 18° | 0.27→0.90 | 0.163 @ 0.70 | 148→95 (53°) |
| glacier | midnight → steel → ice | 16° | 0.26→0.90 | 0.111 @ 0.60 | 247→197 (51°) |
| nocturne | blue-black → violet → mauve | 21° | 0.26→0.91 | 0.158 @ 0.50 | 265→325 (60°) |
| solstice | plum-black → red → amber | 26° | 0.26→0.89 | 0.179 @ 0.70 | 331→72 (101°) |

Field settings stay in the measured band across the whole set — angle 16–26°,
blur 20–22% of the long edge, stretch 7–9× — because holding those constant is
most of what makes two frames look like the same treatment.

## Grain

Every preset carries it, at 0.0024 linear-light sigma. Rendered and measured back:
**1.16/255** high-frequency residual at **10.9×** directional anisotropy, against
0.95–1.08 and 8.3–13.9 in the references. It sits below one 8-bit step, so it is
felt rather than seen — but drop it and the output measures as flat vector art.

Order matters. Grain goes in *after* the gradient map and *in linear light*, then
triangular dither on the way to 8 bits. Adding it before the map just re-reads the
ramp at a jittered `t`, which shows up as colour noise instead of luminance grain.

## Three routes

| Route | When | Cost |
|---|---|---|
| Fragment shader (`studio.html`) | interactive, resizable, animatable | octaves × taps noise evaluations per pixel; render on change, not in a rAF loop |
| Node → PNG (`smear-gradient.mjs`) | build-time assets, print resolution | ~0.7 s for 1024×768 |
| SVG filter | a background with no script at all | coarser; `feTurbulence` + one-axis `feGaussianBlur` + `feComponentTransfer` as the gradient map |

The SVG route in full, since it is the least obvious:

```html
<filter id="smear" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.0013 0.055" numOctaves="5" seed="7" result="n"/>
  <feColorMatrix in="n" type="matrix" result="mono"
    values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  .34 .34 .32 0 0"/>
  <feGaussianBlur in="mono" stdDeviation="180 0"/>
  <feComponentTransfer>
    <feFuncR type="table" tableValues="0.20 0.29 0.37 0.47 0.55 0.64 0.74 0.83 0.91 0.97 1.00"/>
    <feFuncG type="table" tableValues="0.13 0.16 0.19 0.23 0.24 0.26 0.28 0.33 0.44 0.58 0.65"/>
    <feFuncB type="table" tableValues="0.12 0.14 0.17 0.18 0.18 0.18 0.17 0.17 0.17 0.19 0.27"/>
  </feComponentTransfer>
</filter>
```

Two notes. `baseFrequency` takes separate x and y values — that pair *is* the
anisotropic stretch. `stdDeviation="180 0"` blurs on one axis only. Rotate the
filtered rect to get θ, and oversize it so the corners stay covered.

## Two things that cost time

**An FFT angle read off bin indices is wrong on a non-square image.** Bins sit at
k/W and k/H, so the angle has to be taken in cycles-per-pixel
(f_x = Δx/W, f_y = Δy/H), not from the raw index offsets. On these 1024×768
frames the uncorrected version reads **+7°** high, consistently. It was caught by
calibrating both estimators against synthetic white noise blurred at a known
angle — worth doing before trusting any orientation measurement. The structure
tensor is worse here: it biases hard toward 45° (measuring 23.8° for a true 15°
and 45.8° for a true 60°).

**A row shear cannot lay a diagonal flat.** Shear–blur–unshear is the fast way to
do a directional blur, but shifting *rows* horizontally maps the direction
(cos θ, sin θ) to (cos θ + s·sin θ, sin θ) — the y component never moves, and the
forward and inverse passes then cancel inside each row, leaving a plain
horizontal blur. Shifting *columns* vertically by `slope · x` is the one that
works: the round trip averages `buf[y + slope·k][x + k]`, which is the line
integral. The symptom is subtle — output angles came out at roughly half the
requested value, because the correctly-stretched fBm was being averaged with a
horizontal smear.

Also: reflect out-of-range reads rather than clamping them. The shear carries
columns past the frame by `|tan θ| · W / 2`, far beyond any sane padding, and
clamping repeats one edge value down a whole column as a hard step.

## Sources

- [A flowing WebGL gradient, deconstructed](https://alexharri.com/blog/webgl-gradients) — gradient-map-a-noise-field, built up in full
- [SVG Filter Effects: Creating Texture with feTurbulence](https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/) — including the directional grain `baseFrequency` gives you
- [feGaussianBlur / stdDeviation](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur) — one axis zero is a directional blur
- [Inigo Quilez, articles](https://iquilezles.org/articles/) — fBm, domain warping, cosine palettes
- [The Book of Shaders: Fractal Brownian Motion](https://thebookofshaders.com/13/)
- [Paper Shaders](https://shaders.paper.design/) — an off-the-shelf React option if this ever needs to ship rather than be understood
