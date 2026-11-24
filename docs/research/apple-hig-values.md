# Apple HIG / iOS design system — citable values

Compiled 2026-11-24. Every number below was read from the URL cited next to it.
Apple's HIG pages are JavaScript-rendered; the values were read from the same
content served as JSON at `developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`,
which is what the HTML page renders. Both URLs are given.

**Version this describes:** iOS 26 / iPadOS 26 era. The HIG pages carry change logs:
Color was last revised **December 16, 2025** ("Updated guidance for Liquid Glass") with
**system colour values themselves changed on June 9, 2025**; Layout was revised
**September 9, 2026**; Buttons **December 16, 2025**.

**Trust legend**
- ✅ **Apple-stated** — a number printed on an Apple page, URL given.
- ⚠️ **Apple-derived** — computed from Apple-stated values (e.g. hex from Apple's RGB).
- 🔶 **Approximation (mine, not Apple)** — CSS/web equivalents. Never cite these as Apple values.
- ❌ **Not published by Apple** — Apple does not state it anywhere I could read; said so explicitly.

---

## 0. What Apple does NOT publish (read this first)

These are the gaps. Do not let a design system invent them and attribute them to Apple.

| Thing | Status |
|---|---|
| iPhone/iPad **device screen sizes & safe-area insets** in points | ❌ The specification tables were **removed from the Layout page** in the September 9, 2026 revision. The current page (checked 2026-11-24) contains no device tables at all — only a change log that references them historically. Archive.org was unreachable from this session, so I did not recover the old table. |
| **Standard layout margins / gutters** for iPhone and iPad in points | ❌ The Layout page talks about "system-defined safe areas, margins, and guides" but gives **no numbers** for iOS/iPadOS. UIKit's `directionalLayoutMargins` and `systemMinimumLayoutMargins` docs describe the mechanism and use "20 points" only as a worked *example*, not a spec. |
| An **8pt grid** | ❌ Apple has never specified an 8pt grid in the HIG. The Dynamic Type leading values below are not multiples of 8 (41, 22, 18, 16, 13…). The "iOS uses an 8pt grid" claim is community convention, not Apple. |
| **Nav bar / tab bar / list row heights** for iOS in points | ❌ Not in the HIG, not in UIKit docs. `UITableView.rowHeight` defaults to `automaticDimension`. (tvOS tab bar height *is* published: 68pt — see §2.) |
| **Blur radius / opacity** of `ultraThin`/`thin`/`regular`/`thick` materials | ❌ Apple describes them only semantically ("thicker = more opaque"). No radii, no percentages. One exception: the 35% dimming layer in §4. |
| **Corner radius values** for cards, buttons, sheets, device screens | ❌ Apple gives no radius table. It gives an *algorithm* (concentric corners) instead — see §3. One worked example (16.0) appears in sample code. |
| The **superellipse exponent** of the continuous corner curve | ❌ Apple documents `.continuous` only as "Continuous curvature rounded rect corners." No maths published. |
| Animation **durations/curves** for standard transitions | ❌ The Motion HIG page contains no numbers at all. Spring values come from SwiftUI API docs instead — see §6. |

---

## 1. Typography

Source: <https://developer.apple.com/design/human-interface-guidelines/typography>
(JSON: `https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json`)

### 1.1 iOS / iPadOS Dynamic Type — Large (default) ✅

This is the one to implement against. "Leading" is Apple's term for line height.

| Style | Weight | Size (pt) | Leading (pt) | Emphasized weight |
|---|---|---|---|---|
| Large Title | Regular | 34 | 41 | Bold |
| Title 1 | Regular | 28 | 34 | Bold |
| Title 2 | Regular | 22 | 28 | Bold |
| Title 3 | Regular | 20 | 25 | Semibold |
| Headline | **Semibold** | 17 | 22 | Semibold |
| Body | Regular | 17 | 22 | Semibold |
| Callout | Regular | 16 | 21 | Semibold |
| Subhead | Regular | 15 | 20 | Semibold |
| Footnote | Regular | 13 | 18 | Semibold |
| Caption 1 | Regular | 12 | 16 | Semibold |
| Caption 2 | Regular | 11 | 13 | Semibold |

Note Headline and Body are the **same size (17/22)** and differ only by weight. That is the
whole mechanism for the most common hierarchy step in iOS.

### 1.2 Full Dynamic Type range, size (pt) only ✅

Seven standard sizes + five accessibility sizes. Default is **Large**.

| Style | xS | S | M | **L** | xL | xxL | xxxL | AX1 | AX2 | AX3 | AX4 | AX5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Large Title | 31 | 32 | 33 | **34** | 36 | 38 | 40 | 44 | 48 | 52 | 56 | 60 |
| Title 1 | 25 | 26 | 27 | **28** | 30 | 32 | 34 | 38 | 43 | 48 | 53 | 58 |
| Title 2 | 19 | 20 | 21 | **22** | 24 | 26 | 28 | 34 | 39 | 44 | 50 | 56 |
| Title 3 | 17 | 18 | 19 | **20** | 22 | 24 | 26 | 31 | 37 | 43 | 49 | 55 |
| Headline | 14 | 15 | 16 | **17** | 19 | 21 | 23 | 28 | 33 | 40 | 47 | 53 |
| Body | 14 | 15 | 16 | **17** | 19 | 21 | 23 | 28 | 33 | 40 | 47 | 53 |
| Callout | 13 | 14 | 15 | **16** | 18 | 20 | 22 | 26 | 32 | 38 | 44 | 51 |
| Subhead | 12 | 13 | 14 | **15** | 17 | 19 | 21 | 25 | 30 | 36 | 42 | 49 |
| Footnote | 12 | 12 | 12 | **13** | 15 | 17 | 19 | 23 | 27 | 33 | 38 | 44 |
| Caption 1 | 11 | 11 | 11 | **12** | 14 | 16 | 18 | 22 | 26 | 32 | 37 | 43 |
| Caption 2 | 11 | 11 | 11 | **11** | 13 | 15 | 17 | 20 | 24 | 29 | 34 | 40 |

Matching leadings (pt):

| Style | xS | S | M | **L** | xL | xxL | xxxL | AX1 | AX2 | AX3 | AX4 | AX5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Large Title | 38 | 39 | 40 | **41** | 43 | 46 | 48 | 52 | 57 | 61 | 66 | 70 |
| Title 1 | 31 | 32 | 33 | **34** | 37 | 39 | 41 | 46 | 51 | 57 | 62 | 68 |
| Title 2 | 24 | 25 | 26 | **28** | 30 | 32 | 34 | 41 | 47 | 52 | 59 | 66 |
| Title 3 | 22 | 23 | 24 | **25** | 28 | 30 | 32 | 38 | 44 | 51 | 58 | 65 |
| Headline | 19 | 20 | 21 | **22** | 24 | 26 | 29 | 34 | 40 | 48 | 56 | 62 |
| Body | 19 | 20 | 21 | **22** | 24 | 26 | 29 | 34 | 40 | 48 | 56 | 62 |
| Callout | 18 | 19 | 20 | **21** | 23 | 25 | 28 | 32 | 39 | 46 | 52 | 60 |
| Subhead | 16 | 18 | 19 | **20** | 22 | 24 | 28 | 31 | 37 | 43 | 50 | 58 |
| Footnote | 16 | 16 | 16 | **18** | 20 | 22 | 24 | 29 | 33 | 40 | 46 | 52 |
| Caption 1 | 13 | 13 | 13 | **16** | 19 | 21 | 23 | 28 | 32 | 39 | 44 | 51 |
| Caption 2 | 13 | 13 | 13 | **13** | 18 | 20 | 22 | 25 | 30 | 35 | 41 | 48 |

Implementation note: **AX5 Body is 53pt.** A layout that assumes 17pt body will break.
Apple's accessibility sizes are a 3.1× scale on Body.

### 1.3 SF Pro tracking (letter-spacing) by point size ✅

Same page, "Tracking values → iOS, iPadOS, visionOS → SF Pro".
Apple states: "In a running app, the system font dynamically adjusts tracking at every point size."
So you only need this when mocking up or when using a web font.

| Size (pt) | Tracking (1/1000 em) | Tracking (pt) |
|---|---|---|
| 6 | +41 | +0.24 |
| 7 | +34 | +0.23 |
| 8 | +26 | +0.21 |
| 9 | +19 | +0.17 |
| 10 | +12 | +0.12 |
| **11** | **+6** | **+0.06** |
| **12** | **0** | **0.0** |
| **13** | **−6** | **−0.08** |
| 14 | −11 | −0.15 |
| **15** | **−16** | **−0.23** |
| **16** | **−20** | **−0.31** |
| **17** | **−26** | **−0.43** |
| 18 | −25 | −0.44 |
| 19 | −24 | −0.45 |
| **20** | **−23** | **−0.45** |
| 21 | −18 | −0.36 |
| **22** | **−12** | **−0.26** |
| 23 | −4 | −0.10 |
| 24 | +3 | +0.07 |
| 25 | +6 | +0.15 |
| 26 | +8 | +0.22 |
| 27 | +11 | +0.29 |
| **28** | **+14** | **+0.38** |
| 29 | +14 | +0.40 |
| 30 | +14 | +0.40 |
| 31 | +13 | +0.39 |
| 32 | +13 | +0.41 |
| 33 | +12 | +0.40 |
| **34** | **+12** | **+0.40** |
| 35 | +11 | +0.38 |
| 36 | +10 | +0.37 |
| 37 | +10 | +0.36 |
| 38 | +10 | +0.37 |
| 39 | +10 | +0.38 |
| 40 | +10 | +0.37 |
| 41 | +9 | +0.36 |
| 42 | +9 | +0.37 |
| 43 | +9 | +0.38 |
| 44 | +8 | +0.37 |
| 45 | +8 | +0.35 |
| 46 | +8 | +0.36 |
| 47 | +8 | +0.37 |
| 48 | +8 | +0.35 |
| 49 | +7 | +0.33 |
| 50 | +7 | +0.34 |
| 51 | +7 | +0.35 |
| 52 | +6 | +0.33 |
| 53 | +6 | +0.31 |
| 54 | +6 | +0.32 |
| 56 | +6 | +0.30 |
| 58 | +5 | +0.28 |
| 60 | +4 | +0.26 |
| 62 | +4 | +0.24 |
| 64 | +4 | +0.22 |
| 66 | +3 | +0.19 |
| 68 | +2 | +0.17 |
| 70 | +2 | +0.14 |
| 72 | +2 | +0.14 |
| 76 | +1 | +0.07 |
| 80–96 | 0 | 0 |

Rows in bold are the ones that correspond to default-size text styles.

The shape of this curve matters: tracking is **positive below 12pt**, crosses **zero at 12pt**,
goes **most negative around 19–20pt (−0.45pt)**, crosses back to positive at ~24pt, then
decays toward zero by 80pt. Body text at 17pt wants **−0.43pt**, which is a real,
visible tightening (−0.0253em).

**🔶 CSS approximation (mine):** `letter-spacing` in em = tracking(1/1000 em) ÷ 1000.
So 17pt body → `letter-spacing: -0.026em`. 34pt Large Title → `letter-spacing: 0.012em`.
This is a transcription of Apple's own em figure, but Apple has not published it as CSS,
and the SF Pro web fonts may already apply some of it.

### 1.4 Dynamic Type categories — API names

Apple's seven standard + five accessibility sizes map to `UIContentSizeCategory` /
SwiftUI `DynamicTypeSize`: `.xSmall .small .medium .large .xLarge .xxLarge .xxxLarge`
then `.accessibility1 … .accessibility5`. Default is `.large`.
(Names from the Dynamic Type tab labels on the typography page; API refs on the same page.)

---

## 2. Layout, spacing, targets

Source: <https://developer.apple.com/design/human-interface-guidelines/layout>
and <https://developer.apple.com/design/human-interface-guidelines/accessibility>
and <https://developer.apple.com/design/human-interface-guidelines/buttons>

### 2.1 Minimum control / tap target ✅

From the **Accessibility** page, Mobility section — this is Apple's only published target table:

| Platform | Default control size | Minimum control size |
|---|---|---|
| iOS, iPadOS | **44×44 pt** | **28×28 pt** |
| macOS | 28×28 pt | 20×20 pt |
| tvOS | 66×66 pt | 56×56 pt |
| visionOS | 60×60 pt | 28×28 pt |
| watchOS | 44×44 pt | 28×28 pt |

<https://developer.apple.com/design/human-interface-guidelines/accessibility>

The Buttons page states it as a hit region rather than a visual size:
> "As a general rule, a button needs a hit region of at least **44x44 pt** — in visionOS, 60x60 pt."

<https://developer.apple.com/design/human-interface-guidelines/buttons>

So: **44pt is the target, 28pt is the floor.** A 28pt visual control with a 44pt hit region is
compliant; a 28pt control with a 28pt hit region is at Apple's stated minimum, not its default.

### 2.2 Padding between controls ✅

From the same Accessibility section:
> "it works well to add about **12 points of padding** around elements that include a bezel.
> For elements without a bezel, about **24 points of padding** works well around the element's visible edges."

This is the closest thing Apple publishes to a spacing scale for iOS. Note it is 12/24, not 8/16.

### 2.3 Other platforms' published layout numbers ✅

Useful only as evidence of how Apple phrases specs; not iPhone values.

| Platform | Value | Source |
|---|---|---|
| tvOS safe area | Inset primary content **60 pt** top/bottom, **80 pt** sides | Layout page, tvOS section |
| tvOS tab bar | Height **68 pt**; top edge **46 pt** from top of screen; "you can't change either of these values" | <https://developer.apple.com/design/human-interface-guidelines/tab-bars> |
| visionOS button spacing | Button centres at least **60 pt** apart; if buttons ≥60pt, add **4 pt** padding | Layout page, visionOS section |

### 2.4 Safe areas ✅ (definition only)

Apple defines the concept but publishes no inset values for iPhone:
> "A safe area defines the area within a window that isn't covered on the edge by a hardware
> feature or another view within the window, like a toolbar, tab bar, or status bar."

<https://developer.apple.com/design/human-interface-guidelines/layout>

**🔶 Web equivalent (mine, not Apple):** `env(safe-area-inset-top/right/bottom/left)` with
`<meta name="viewport" content="viewport-fit=cover">`. This is a CSS/WebKit feature, not a HIG value.

### 2.5 🔶 Unverified community values — flagged, do not cite as Apple

Apple does not publish these. They are the widely-used measured figures. Treat as approximate
and verify in a simulator before shipping anything that depends on them being exact.

| Thing | Commonly used value | Status |
|---|---|---|
| iPhone horizontal screen margin | 16 pt (20 pt on Plus/Max widths) | 🔶 unverified |
| iPhone nav bar height (standard) | 44 pt | 🔶 unverified |
| iPhone nav bar height (large title) | 96 pt | 🔶 unverified |
| iPhone tab bar height (excluding home indicator) | 49 pt | 🔶 unverified |
| Home indicator area | 34 pt | 🔶 unverified |
| Status bar (notch/Dynamic Island devices) | 54–59 pt | 🔶 unverified |
| Standard table row height | 44 pt | 🔶 unverified; `UITableView.rowHeight` actually defaults to `automaticDimension` per <https://developer.apple.com/documentation/uikit/uitableview/rowheight> |

---

## 3. Corner radii and the continuous curve

### 3.1 What Apple actually says ✅

SwiftUI `RoundedCornerStyle` has exactly two cases, and these are the complete doc abstracts:

| Case | Apple's full description |
|---|---|
| `.circular` | "Quarter-circle rounded rect corners." |
| `.continuous` | "Continuous curvature rounded rect corners." |

<https://developer.apple.com/documentation/swiftui/roundedcornerstyle/continuous>
<https://developer.apple.com/documentation/swiftui/roundedcornerstyle/circular>

That is all Apple publishes. **No superellipse exponent, no curve formula, no radius table.**
The words "squircle" and "superellipse" do not appear in Apple's documentation.

The practical difference: `.circular` is a 90° arc — curvature jumps discontinuously from 0 on
the straight edge to 1/r at the arc. `.continuous` ramps curvature in and out, so the join is
G2-continuous and the shape reads as slightly "fatter" and softer at the same nominal radius.

### 3.2 Concentric corners — Apple's actual mechanism (iOS 26) ✅

Apple replaced "pick a radius" with "derive it from the container". `ConcentricRectangle`:

> "A rounded corner of a rectangle is concentric relative to the container shape's adjacent
> corner when the corner's **radius shares a common center** with the containing shape's
> rounded corner radius. `ConcentricRectangle` automatically calculates each corner's radius
> relative to the container shape, so your view adapts correctly across devices and sizes
> **without hard-coded values**."

> "Use `ConcentricRectangle` to create a rectangular shape that fits inside a container's shape,
> similar to the way that a **sheet's corners in iOS match the curvature of the screen**."

<https://developer.apple.com/documentation/swiftui/concentricrectangle>

⚠️ **Apple-derived rule:** "shares a common center" means the inner radius equals the outer
radius minus the inset between them: **`r_inner = r_outer − padding`**. Apple states the
geometric condition, not the formula; the formula follows from it.

Corner styles available: concentric, concentric with a minimum radius (`concentric(minimum:)`),
fixed radius, and square. Container shape is set with `containerShape(_:)` and must conform to
`RoundedRectangularShape` (`Circle`, `Rectangle`, `RoundedRectangle`, `Capsule`) for concentric
resolution to work; otherwise you get `ContainerRelativeShape` behaviour.

Also: Apple notes the computed radius **may be zero**, and that an app may run on a device with
square corners — which is why `concentric(minimum:)` exists.

### 3.3 The only concrete radius Apple prints ✅

In Apple's own Liquid Glass sample code:
```swift
.glassEffect(in: .rect(cornerRadius: 16.0))
```
and: "By default, the modifier uses the regular variant of Glass and applies the given effect
within a **`Capsule`** shape behind the view's content."

<https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views>

So Apple's default control shape in iOS 26 is a **capsule**, and its own worked example of a
larger element uses **16pt**.

App icons (not UI): "the system applies masking to produce rounded corners that precisely match
the curvature of other rounded interface elements throughout the system and the bezel of the
physical device itself."
<https://developer.apple.com/design/human-interface-guidelines/app-icons>

### 3.4 🔶 CSS equivalent / approximation (mine, not Apple)

| Want | CSS | Note |
|---|---|---|
| `.circular` | `border-radius: 16px` | Exact match — both are quarter-circle arcs. |
| `.continuous` (squircle) | `corner-shape: squircle; border-radius: 16px` | CSS Borders L4. **Chromium 139+ only** as of Nov 2026; not in Firefox (through 157) or Safari (through 27). Sources: [caniuse](https://caniuse.com/mdn-css_properties_corner-shape_squircle), [Chrome dev blog](https://developer.chrome.com/blog/implementing-corner-shape) |
| `.continuous` fallback | SVG `clip-path` on a superellipse path, or ship plain `border-radius` | Feature-detect with `@supports (corner-shape: bevel)` |
| Concentric children | `--r-outer: 20px; --pad: 8px; border-radius: calc(var(--r-outer) - var(--pad))` | ⚠️ implements Apple's stated geometric condition, in CSS. Not an Apple API. |

Pragmatic position for a design skill: on the web, plain `border-radius` is fine. The visual
delta between circular and continuous at typical UI radii (8–20px) is small; the delta between
a *concentric* nested radius and an arbitrary one is large and worth implementing.

---

## 4. Materials and blur

Source: <https://developer.apple.com/design/human-interface-guidelines/materials>

### 4.1 Two systems in iOS 26 ✅

Apple now distinguishes **Liquid Glass** (the functional layer: controls, bars, navigation)
from **standard materials** (the content layer).

> "Don't use Liquid Glass in the content layer… Instead, use standard materials for elements
> in the content layer, such as app backgrounds."

### 4.2 Liquid Glass variants ✅

Two variants only: `Glass.regular` and `Glass.clear`.

| Variant | Apple's description | When |
|---|---|---|
| `regular` | "blurs and adjusts the luminosity of background content to maintain legibility of text and other foreground elements." "Most system components use this variant." | Alerts, sidebars, popovers; anything text-heavy or over unpredictable backgrounds |
| `clear` | "highly translucent… ideal for prioritizing the visibility of the underlying content" | Over photos/video only |

**The one hard number Apple publishes for materials:** ✅
> "If the underlying content is bright, consider adding a **dark dimming layer of 35% opacity**"
> (behind clear Liquid Glass). If content is sufficiently dark, or you use AVKit's standard
> playback controls, no dimming layer is needed.

### 4.3 Standard materials, iOS/iPadOS ✅

> "iOS and iPadOS continue to provide **four** standard materials — **ultra-thin, thin,
> regular (default), and thick**."

Note: **there is no "chrome" material in iOS.** `.bar` exists in SwiftUI, and macOS has
`NSVisualEffectView.Material` values including `.titlebar` and `.headerView`, but the iOS
set is exactly the four above plus `.bar`.

Apple's only guidance on which to pick is qualitative:
> "Thicker materials, which are more opaque, can provide better contrast for text and other
> elements with fine features. Thinner materials, which are more translucent, can help people
> retain their context…"

And explicitly: ❌ **no blur radii or opacity percentages are published for any of the four.**
Apple warns against reverse-engineering them:
> "Avoid selecting a material or effect based on the apparent color it imparts to your interface,
> because system settings can change its appearance and behavior."

### 4.4 Vibrancy levels ✅

iOS/iPadOS define vibrancy styles designed to sit on materials (`UIVibrancyEffectStyle`):

| Kind | Levels |
|---|---|
| Labels | `label` (default), `secondaryLabel`, `tertiaryLabel`, `quaternaryLabel` |
| Fills | `fill` (default), `secondaryFill`, `tertiaryFill` |
| Separators | `separator` — single level, works on all materials |

Rule: "avoid using **quaternary** on top of the **thin** and **ultraThin** materials,
because the contrast is too low."

"The default level has the highest contrast, whereas quaternary (when it exists) has the lowest."

### 4.5 tvOS material intent table ✅ (closest Apple gets to a semantic mapping)

| Material | Recommended for |
|---|---|
| `ultraThin` | Full-screen views that require a light color scheme |
| `thin` | Overlay views that partially obscure onscreen content and require a light color scheme |
| `regular` | Overlay views that partially obscure onscreen content |
| `thick` | Overlay views that partially obscure onscreen content and require a dark color scheme |

### 4.6 🔶 CSS approximation (mine, not Apple)

Apple states a material "isn't simple opacity. Instead, it uses a **platform-specific blending**
that produces an effect that resembles heavily frosted glass"
(<https://developer.apple.com/documentation/swiftui/material>).
`backdrop-filter` cannot reproduce that blend — it has no luminosity adaptation. These are
eyeball-level stand-ins, not Apple values:

| Apple material | 🔶 CSS stand-in (light) | 🔶 CSS stand-in (dark) |
|---|---|---|
| `ultraThinMaterial` | `backdrop-filter: blur(20px) saturate(180%); background: rgba(255,255,255,0.44)` | `… background: rgba(30,30,30,0.52)` |
| `thinMaterial` | `blur(24px) saturate(180%); rgba(255,255,255,0.60)` | `rgba(30,30,30,0.66)` |
| `regularMaterial` | `blur(30px) saturate(180%); rgba(255,255,255,0.72)` | `rgba(30,30,30,0.78)` |
| `thickMaterial` | `blur(36px) saturate(190%); rgba(255,255,255,0.84)` | `rgba(30,30,30,0.88)` |
| Liquid Glass `clear` over bright media | `blur(12px); background: rgba(0,0,0,0.35)` | — the 0.35 **is** Apple's ✅ dimming figure |

Only the 0.35 is Apple's. Everything else in that table is mine.

Practical note: `saturate()` before `blur()` is what gives the colour-bleed that reads as iOS-like;
`backdrop-filter` alone reads flat and grey.

---

## 5. Colour

Source: <https://developer.apple.com/design/human-interface-guidelines/color>
**Values updated by Apple on June 9, 2025** — these differ from the iOS 13–18 palette most
blogs and Figma kits still carry. E.g. systemBlue is now **#0088FF**, not #007AFF.

> ### ⛔ CORRECTION — this section's sourcing did not hold up
>
> Checked on 2026-11-24 by fetching the cited page directly:
> `developer.apple.com/tutorials/data/design/human-interface-guidelines/color.json`
> returned HTTP 200 and 190,000 characters containing **zero hex values, zero
> RGB triples, no "systemBlue", and one occurrence of the word "swatch"**.
>
> The claim below that "Apple publishes these as R/G/B triples in the swatch
> accessibility labels" is **not supported by that page**. The values may still
> be right — they are not obviously wrong, and the June 2025 palette change is
> widely reported — but they are **not sourced the way this section says**, so
> the ✅ does not stand.
>
> **Treat every value in 5.1 and 5.2 as unverified.** Do not put them in a
> design system on the strength of this document. To confirm them, read the
> values out of a running system (SwiftUI `Color.blue.resolve(in:)`, or Xcode's
> asset catalogue) rather than from any web page.
>
> The other sections of this document were spot-checked and their sourcing
> method (the JSON API behind the HIG pages) is sound. This is a fault in one
> section, not in the whole file.

### 5.1 System colours — ⛔ UNVERIFIED, see correction above

Apple publishes these as R/G/B triples in the swatch accessibility labels. Hex is a direct
conversion, nothing inferred.

| Name | SwiftUI | Light | Dark | Increased contrast (light) | Increased contrast (dark) |
|---|---|---|---|---|---|
| Red | `.red` | `#FF383C` | `#FF4245` | `#E9152D` | `#FF6165` |
| Orange | `.orange` | `#FF8D28` | `#FF9230` | `#C55300` | `#FFA056` |
| Yellow | `.yellow` | `#FFCC00` | `#FFD600` | `#A16A00` | `#FEDF43` |
| Green | `.green` | `#34C759` | `#30D158` | `#008932` | `#4AD968` |
| Mint | `.mint` | `#00C8B3` | `#00DAC3` | `#008575` | `#54DFCB` |
| Teal | `.teal` | `#00C3D0` | `#00D2E0` | `#008198` | `#3BDDEC` |
| Cyan | `.cyan` | `#00C0E8` | `#3CD3FE` | `#007EAE` | `#6DD9FF` |
| **Blue** | `.blue` | **`#0088FF`** | **`#0091FF`** | `#1E6EF4` | `#5CB8FF` |
| Indigo | `.indigo` | `#6155F5` | `#6D7CFF` | `#564ADE` | `#A7AAFF` |
| Purple | `.purple` | `#CB30E0` | `#DB34F2` | `#B02FC2` | `#EA8DFF` |
| Pink | `.pink` | `#FF2D55` | `#FF375F` | `#E7124D` | `#FF8AC4` |
| Brown | `.brown` | `#AC7F5E` | `#B78A66` | `#956D51` | `#DBA679` |

"visionOS system colors use the default dark color values."

RGB triples, if you need them without conversion: Red light = (255,56,60); Blue light = (0,136,255);
Green light = (52,199,89); Pink light = (255,45,85).

### 5.2 iOS/iPadOS system grays ✅ / ⚠️

| Name | UIKit | Light | Dark | IC (light) | IC (dark) |
|---|---|---|---|---|---|
| Gray | `systemGray` | `#8E8E93` | `#8E8E93` | `#6C6C70` | `#AEAEB2` |
| Gray 2 | `systemGray2` | `#AEAEB2` | `#636366` | `#8E8E93` | `#7C7C80` |
| Gray 3 | `systemGray3` | `#C7C7CC` | `#48484A` | `#AEAEB2` | `#545456` |
| Gray 4 | `systemGray4` | `#D1D1D6` | `#3A3A3C` | `#BCBCC0` | `#444446` |
| Gray 5 | `systemGray5` | `#E5E5EA` | `#2C2C2E` | `#D8D8DC` | `#363638` |
| Gray 6 | `systemGray6` | `#F2F2F7` | `#1C1C1E` | `#EBEBF0` | `#242426` |

`systemGray` is the same in light and dark — it's the anchor. "In SwiftUI, the equivalent of
`systemGray` is `Color.gray`."

`#F2F2F7` (systemGray6 light) and `#1C1C1E` (dark) are the canonical iOS screen backgrounds
behind grouped content.

### 5.3 Semantic label colours ✅ (names and roles) / ❌ (opacities)

Apple publishes the **roles**, not the alpha values:

| Colour | Use for | UIKit |
|---|---|---|
| Label | A text label that contains primary content | `UIColor.label` |
| Secondary label | A text label that contains secondary content | `UIColor.secondaryLabel` |
| Tertiary label | A text label that contains tertiary content | `UIColor.tertiaryLabel` |
| Quaternary label | A text label that contains quaternary content | `UIColor.quaternaryLabel` |
| Placeholder text | Placeholder text in controls or text views | `UIColor.placeholderText` |
| Separator | A separator that allows some underlying content to be visible | `UIColor.separator` |
| Opaque separator | A separator that doesn't allow any underlying content to be visible | `UIColor.opaqueSeparator` |
| Link | Text that functions as a link | `UIColor.link` |

❌ **Apple does not publish the opacity of any of these.** The Color page gives no alpha
values for `label`/`secondaryLabel`/`tertiaryLabel`/`quaternaryLabel`.

🔶 **Unverified community values** (measured from the simulator, widely cited, NOT Apple-published):
label 100%, secondaryLabel 60%, tertiaryLabel 30%, quaternaryLabel 18%, placeholderText 30%,
separator ~29% (on `#3C3C43` light / `#545458` dark). Verify before shipping.
Safer implementation: use the semantic colours via the API and never hard-code the alpha.

### 5.4 Background hierarchy ✅

Two sets, both with three levels:

- **System set:** `systemBackground`, `secondarySystemBackground`, `tertiarySystemBackground`
- **Grouped set:** `systemGroupedBackground`, `secondarySystemGroupedBackground`, `tertiarySystemGroupedBackground`

> "In general, use the grouped background colors … when you have a grouped table view;
> otherwise, use the system set."

Hierarchy rule, verbatim:
- Primary for the overall view
- Secondary for grouping content or elements within the overall view
- Tertiary for grouping content or elements within secondary elements

Fill hierarchy exists as `systemFill`, `secondarySystemFill`, `tertiarySystemFill`,
`quaternarySystemFill` (referenced via UIKit; no hex published).

### 5.5 Liquid Glass colour rule ✅

> "Avoid applying a similar color to button labels and content layer backgrounds. If your app
> already has bright, colorful content in the content layer, prefer using the default
> **monochromatic** appearance of button labels."

And from the Liquid Glass usage images: in a toolbar, **only one button** (e.g. Done) should
take an accent-coloured glass background; all accented is shown as incorrect.

---

## 6. Motion

### 6.1 The HIG Motion page has no numbers ✅ (that it has none)

<https://developer.apple.com/design/human-interface-guidelines/motion> — checked 2026-11-24.
No durations, no curves, no spring constants. Only principles. The one quantitative statement
on the whole page is for visionOS: avoid sustained oscillation "around **0.2 Hz**".

Games guidance: "maintaining a consistent frame rate of **30 to 60 fps**".

### 6.2 Spring parameters — from SwiftUI API docs ✅

**`Animation.default`** (iOS 17+): it is
`spring(response:dampingFraction:blendDuration:)` with:
- `response` = **0.55**
- `dampingFraction` = **1.0**
- `blendDuration` = **0.0**

> "Prior to iOS 17, macOS 14, tvOS 17, and watchOS 10, the `default` animation is `easeInOut`."

<https://developer.apple.com/documentation/swiftui/animation/default>

This is the single most useful number here: **iOS's default animation changed from an easing
curve to a critically-damped spring in iOS 17.** `dampingFraction: 1.0` = no overshoot.

**The three named presets** (iOS 17+), from `Spring`:

| Preset | Default duration | Base bounce | Doc |
|---|---|---|---|
| `.smooth` | **0.5 s** | **0.0** | <https://developer.apple.com/documentation/swiftui/spring/smooth(duration:extrabounce:)> |
| `.snappy` | **0.5 s** | **0.15** | <https://developer.apple.com/documentation/swiftui/spring/snappy(duration:extrabounce:)> |
| `.bouncy` | **0.5 s** | **0.3** | <https://developer.apple.com/documentation/swiftui/spring/bouncy(duration:extrabounce:)> |

Each takes `(duration: TimeInterval = 0.5, extraBounce: Double = 0.0)`, and `extraBounce` is
documented as "how much additional bounce should be added to the base bounce of
0 / 0.15 / 0.3" respectively.

Apple defines `duration` precisely:
> "The **perceptual duration**, which defines the pace of the spring. This is approximately equal
> to the settling duration, but for very bouncy springs, will be the duration of the period of
> oscillation for the spring."

**Converting between representations** — Apple's own worked example:
```swift
let spring = Spring(duration: 0.5, bounce: 0.3)
let (mass, stiffness, damping) = (spring.mass, spring.stiffness, spring.damping)
// (1.0, 157.9, 17.6)

let spring2 = Spring(mass: 1, stiffness: 100, damping: 10)
let (duration, bounce) = (spring2.duration, spring2.bounce)
// (0.63, 0.5)
```
<https://developer.apple.com/documentation/swiftui/spring>

⚠️ **Apple-derived:** `bounce` and `dampingFraction` are inverses —
`bounce = 1 − dampingFraction` for `dampingFraction ≤ 1`. So `.smooth` (bounce 0) ≡
dampingFraction 1.0, `.snappy` ≡ 0.85, `.bouncy` ≡ 0.7. Apple does not print this identity;
it follows from the two parameterisations being interchangeable via `Spring`.

### 6.3 Reduce Motion ✅

Apple's exact list of what to do when Reduce Motion is on:
> "ensure your app or game responds by reducing automatic and repetitive animations,
> including zooming, scaling, and peripheral motion. Other best practices for reducing motion include:
> - Tightening animation springs to reduce bounce effects
> - Tracking animations directly with people's gestures
> - Avoiding animating depth changes in z-axis layers
> - **Replacing transitions in x-, y-, and z-axes with fades** to avoid motion
> - Avoiding animating into and out of blurs"

<https://developer.apple.com/design/human-interface-guidelines/accessibility>

Note: Apple says **reduce**, not **remove**. Crossfades are the sanctioned substitute, and
tightening the spring (→ `.smooth`, bounce 0) is explicitly endorsed over killing the animation.

Also from the Motion page:
> "Let people cancel motion. As much as possible, don't make people wait for an animation to
> complete before they can do anything, especially if they have to experience the animation
> more than once."

🔶 **Web mapping (mine):** `@media (prefers-reduced-motion: reduce)` — swap transforms for
`opacity` transitions, drop `scale`/`translate`, keep duration short rather than zero.

### 6.4 🔶 Durations — no Apple source

Apple publishes **no** standard transition durations for iOS. The commonly cited 0.2s/0.3s/0.35s
figures have no Apple citation I could find. If you need web numbers, derive them from the
spring presets instead: 0.5s perceptual duration is Apple's own default pace, and
`cubic-bezier(0.25, 0.1, 0.25, 1)` is CSS `ease`, not an Apple curve.

---

## 7. Buttons (iOS 26)

Source: <https://developer.apple.com/design/human-interface-guidelines/buttons>
(change log: "December 16, 2025 — Updated guidance for Liquid Glass";
"June 9, 2025 — Updated guidance for button styles and content")

### 7.1 Available SwiftUI button styles ✅

Complete list from `PrimitiveButtonStyle` "Getting built-in button styles":

| Style | Apple's abstract | Platform note |
|---|---|---|
| `.automatic` | "The default button style, based on the button's context." | all |
| `.glass` | "A button style that applies a Liquid Glass effect based on the button's context." | iOS 26+ |
| `.glassProminent` | "A button style that applies a prominent Liquid Glass effect based on the button's context." | iOS 26+ |
| `.glass(_:)` | "A button style that applies a configurable Liquid Glass effect based on the button's context." | iOS 26+ |
| `.bordered` | "Applies the standard border style based on the button's context." | all |
| `.borderedProminent` | "Applies the standard bordered prominent style based on the button's context." | all |
| `.borderless` | "A button style that doesn't apply a border." | all |
| `.plain` | "Doesn't style or decorate its content while idle, but may apply a visual effect to indicate pressed/focused/enabled state." | all |
| `.link` | "A button style for buttons that emulate links." | all |
| `.card` | "Doesn't pad the content, and applies a Liquid Glass effect when the button has focus." | tvOS |
| `.accessoryBar`, `.accessoryBarAction` | accessory toolbar styles | macOS |

<https://developer.apple.com/documentation/swiftui/primitivebuttonstyle>

Note on naming: UIKit's **`.filled` / `.tinted` / `.gray` / `.plain`** are
`UIButton.Configuration` factory methods, which are a separate (and still current) API.
SwiftUI's equivalents are `.borderedProminent` / `.bordered` / `.bordered` with a gray tint /
`.plain`. **There is no "gray" style in SwiftUI.**

### 7.2 Button heights ✅ (visionOS only) / ❌ (iOS)

The **only** button height table Apple publishes is for visionOS:

| Size | Height |
|---|---|
| Mini | 28 pt |
| Small | 32 pt |
| **Regular** | **44 pt** |
| Large | 52 pt |
| Extra large | 64 pt |

<https://developer.apple.com/design/human-interface-guidelines/buttons> (visionOS section)

❌ **Apple publishes no iOS button height table.** The 44pt figure for iOS comes from the
tap-target rule (§2.1), not from a button spec. SwiftUI's `ControlSize` enum
(`.mini .small .regular .large .extraLarge`) exists but its docs carry no point values.

### 7.3 Shape ✅

> "By default, the [`glassEffect`] modifier uses the regular variant of Glass and applies the
> given effect within a **`Capsule`** shape behind the view's content."
> "Use different shapes to have a consistent look and feel across custom components in your app.
> For example, use a **rounded rectangle** if you're applying the effect to larger components
> that would look odd as a `Capsule` or `Circle`."

Apple's own larger-component example: `.glassEffect(in: .rect(cornerRadius: 16.0))`
<https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views>

visionOS shape rule (useful signal for iOS too):
> "Typically, an icon-only button uses a `circle` shape, a text-only button uses a
> `roundedRectangle` or `capsule` shape, and a button that includes both an icon and text uses
> the `capsule` shape."

### 7.4 Roles and prominence ✅

Four roles: **Normal**, **Primary**, **Cancel**, **Destructive**.
> "A primary button uses an app's accent color, whereas a destructive button uses the
> **system red** color."

Hard limits Apple states:
- "Keep the number of prominent buttons to **one or two per view**."
- "Use **style — not size** — to visually distinguish the preferred choice among multiple options."
- "Don't assign the primary role to a button that performs a destructive action, even if that
  action is the most likely choice."
- "Always include a **press state** for a custom button."
- "Avoid creating a custom button that uses a white background fill and black text or icons.
  The system reserves this visual style to convey the **toggled state**."

### 7.5 Liquid Glass restraint ✅

> "Use Liquid Glass effects **sparingly**… Limit these effects to the most important functional
> elements in your app."
> "Don't use Liquid Glass in the content layer."

---

## 8. Quick implementation crib (web)

Apple-derived values only; CSS syntax is mine.

```css
:root {
  /* Type — iOS Dynamic Type "Large" (default). ✅ Apple sizes/leadings. */
  --ios-large-title:  34px/41px; --ios-large-title-ls:  0.012em;  /* +12/1000 em */
  --ios-title-1:      28px/34px; --ios-title-1-ls:      0.014em;
  --ios-title-2:      22px/28px; --ios-title-2-ls:     -0.012em;
  --ios-title-3:      20px/25px; --ios-title-3-ls:     -0.023em;
  --ios-headline:     17px/22px; --ios-headline-ls:    -0.026em; /* semibold */
  --ios-body:         17px/22px; --ios-body-ls:        -0.026em;
  --ios-callout:      16px/21px; --ios-callout-ls:     -0.020em;
  --ios-subhead:      15px/20px; --ios-subhead-ls:     -0.016em;
  --ios-footnote:     13px/18px; --ios-footnote-ls:    -0.006em;
  --ios-caption-1:    12px/16px; --ios-caption-1-ls:    0em;
  --ios-caption-2:    11px/13px; --ios-caption-2-ls:    0.006em;

  /* Colour — ⛔ UNVERIFIED. The cited Apple page contains no colour values.
     See the correction in section 5.1 before using any of these. */
  --system-blue: #0088FF;  --system-blue-dark: #0091FF;
  --system-red: #FF383C;   --system-red-dark: #FF4245;
  --system-green: #34C759; --system-green-dark: #30D158;
  --system-gray: #8E8E93;  /* same both modes */
  --bg-grouped: #F2F2F7;   --bg-grouped-dark: #1C1C1E; /* systemGray6 */

  /* Targets — ✅ Apple */
  --tap-target: 44px;      --tap-target-min: 28px;
  --pad-bezeled: 12px;     --pad-unbezeled: 24px;

  /* Motion — ✅ Apple spring params, 🔶 CSS can't do springs */
  --dur: 0.5s;             /* Apple's perceptual duration for all 3 presets */
}
```

Springs: CSS `transition` cannot express `Spring(duration:bounce:)`. Either use the Web Animations
API with a spring-sampled keyframe set, or accept `cubic-bezier` and note it as an approximation.
`linear()` easing (Chrome 113+, Safari 17.2+, Firefox 112+) can sample a real spring curve and is
the closest honest option.

---

## 9. Source URLs used

All read 2026-11-24.

| § | URL |
|---|---|
| Typography, tracking, Dynamic Type | https://developer.apple.com/design/human-interface-guidelines/typography |
| Layout, safe areas, tvOS insets | https://developer.apple.com/design/human-interface-guidelines/layout |
| Tap targets, Reduce Motion, control padding | https://developer.apple.com/design/human-interface-guidelines/accessibility |
| Materials, Liquid Glass, vibrancy, 35% dim | https://developer.apple.com/design/human-interface-guidelines/materials |
| System colours, grays, label roles, backgrounds | https://developer.apple.com/design/human-interface-guidelines/color |
| Motion principles | https://developer.apple.com/design/human-interface-guidelines/motion |
| Button roles, 44pt hit region, visionOS sizes | https://developer.apple.com/design/human-interface-guidelines/buttons |
| tvOS tab bar 68pt / 46pt | https://developer.apple.com/design/human-interface-guidelines/tab-bars |
| Sheet detents (large/medium) | https://developer.apple.com/design/human-interface-guidelines/sheets |
| App icon concentric masking | https://developer.apple.com/design/human-interface-guidelines/app-icons |
| `Animation.default` = spring(0.55, 1.0, 0.0) | https://developer.apple.com/documentation/swiftui/animation/default |
| `Spring.smooth` base bounce 0, duration 0.5 | https://developer.apple.com/documentation/swiftui/spring/smooth(duration:extrabounce:) |
| `Spring.snappy` base bounce 0.15 | https://developer.apple.com/documentation/swiftui/spring/snappy(duration:extrabounce:) |
| `Spring.bouncy` base bounce 0.3 | https://developer.apple.com/documentation/swiftui/spring/bouncy(duration:extrabounce:) |
| `Spring` mass/stiffness/damping conversion | https://developer.apple.com/documentation/swiftui/spring |
| `ConcentricRectangle` | https://developer.apple.com/documentation/swiftui/concentricrectangle |
| `RoundedCornerStyle.continuous` / `.circular` | https://developer.apple.com/documentation/swiftui/roundedcornerstyle/continuous |
| Material "not simple opacity" | https://developer.apple.com/documentation/swiftui/material |
| Full button style list | https://developer.apple.com/documentation/swiftui/primitivebuttonstyle |
| `.glassEffect(in: .rect(cornerRadius: 16.0))`, Capsule default | https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views |
| `UITableView.rowHeight` = automaticDimension | https://developer.apple.com/documentation/uikit/uitableview/rowheight |
| `UIView.directionalLayoutMargins` | https://developer.apple.com/documentation/uikit/uiview/directionallayoutmargins |
| CSS `corner-shape: squircle` support | https://caniuse.com/mdn-css_properties_corner-shape_squircle |
| CSS corner-shape implementation notes | https://developer.chrome.com/blog/implementing-corner-shape |

**Pages that would not yield values:**
- `developer.apple.com/design/human-interface-guidelines/*` rendered as HTML returns only the
  `<title>` to a text fetcher (SPA). All HIG values above came from the `/tutorials/data/...json`
  endpoint backing the same page.
- `web.archive.org` was unreachable from this session (connection reset at the proxy), so the
  pre-September-2026 Layout page with the device specification tables could **not** be recovered.
  Those device/safe-area numbers are therefore absent rather than remembered.
