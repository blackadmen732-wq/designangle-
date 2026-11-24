# Licences of the design systems this kit reads from

Design Angle is sold. That makes the licence of anything copied into it a
commercial question, not a formality. Every package below was downloaded and
its own LICENSE file read on **24 November 2026**.

The short version: **almost none of this needs reverse engineering, and one
of them must not be copied at all.**

---

## Safe to use

| Package | Version | Licence | Used for |
|---|---|---|---|
| `baseui` (Uber Base Web) | 18.2.0 | MIT | motion curves, duration ladder, sizing scale |
| `@material/web` | tokens `v0_192` | Apache-2.0 | elevation, shape, space, motion tokens |
| `@carbon/layout` | 11.63.0 | Apache-2.0 | spacing scale, cross-check |
| `open-props` | 1.7.23 | MIT | easing intensity scale, cross-check |

MIT and Apache-2.0 both allow commercial use, modification and distribution.
Both require the copyright notice and licence text to be kept with any
substantial portion you copy. Apache-2.0 additionally grants a patent licence
and requires you to state what you changed.

**What this means in practice:** copying a handful of numeric token values —
`cubic-bezier(0.22, 1, 0.36, 1)`, an 8px space unit — is not a substantial
portion of anything, and the values are facts about a design, not creative
expression. Copying files, or a whole scale verbatim as the kit's own system,
is substantial, and then the notice goes in.

---

## ⛔ Shopify Polaris — do not copy into this kit

`@shopify/polaris-tokens` 9.4.2 declares `"SEE LICENSE IN LICENSE.md"`, not a
standard SPDX identifier. That is the warning sign, and reading the file shows
why. It opens as MIT, and then adds:

> The rights granted above may only be exercised to develop and distribute
> applications that **integrate or interoperate with Shopify software or
> services**, and in the case of external, stand-alone applications that do not
> embed directly inside Shopify, the rights granted above may only be exercised
> to develop and distribute applications that are **dissimilar and visually
> distinct from Shopify products and services** … **as determined by Shopify in
> its sole discretion**.

Read what that does to this kit:

1. Design Angle builds standalone client websites. It does **not** integrate
   or interoperate with Shopify.
2. So the only grant available is the second one, which requires the result to
   be *dissimilar and visually distinct from Shopify products*.
3. And Shopify decides what counts, **in its sole discretion**. There is no
   test you can apply in advance and no threshold you can measure against.

A design kit whose entire purpose is to make screens that look like good
commerce software is the worst possible fit for a clause that forbids looking
like Shopify's commerce software, judged by Shopify.

**Decision: Polaris is not read from, and nothing from it is in this repo.**
Carbon covers the same ground — dense, data-heavy, commercial — under
Apache-2.0 with no field-of-use restriction.

This matters because the expansion research lists Polaris in the same table as
Carbon, Primer and Material, under "learn from professional design systems",
with no distinction drawn. Looking at a published design system to understand
how it thinks is fine. Copying its token values into a product you sell is a
different act, and for this one it is not permitted.

---

## Apple

Apple's Human Interface Guidelines are documentation, not a licensed token
package. There is no file to install and nothing that grants reuse.

- **Measurements and behaviours described in the HIG** — 44pt targets, the
  safe-area concept, how a navigation bar behaves — are facts about how the
  platform works. Building software that follows them is the intended use.
- **Apple's fonts, icons, and artwork** are not. SF Pro, SF Symbols and the
  system icon set ship under Apple's own licence, which restricts use to
  Apple platforms. **Do not put SF Symbols in a client's website.** Use
  Lucide (ISC) or Iconify, which are licensed for it.
- Wherever this repo states an Apple value, it says where the number came from
  and whether it was verified. `docs/research/apple-hig-values.md` section 5.1
  is marked unverified for exactly this reason, and stays marked until it is
  checked against a primary source.

---

## The general rule for this repo

Before any value, file or scale from an outside project enters this kit:

1. `npm view <package> license` — and if it is not a plain SPDX identifier,
   **read the actual LICENSE file**. `"SEE LICENSE IN LICENSE.md"` is the
   signal that there is a condition worth finding.
2. Record the package, version, licence and what was taken, in this file.
3. Ask whether what is being copied is a fact or an expression. A contrast
   ratio and an 8px grid unit are facts. A component's source, an icon set and
   a complete colour system are expression.
4. If the licence restricts the field of use at all, the answer is no. There
   is always an Apache-2.0 or MIT equivalent, and a clause a vendor adjudicates
   at its sole discretion is not a risk worth carrying on a product you sell.

---

## Still outstanding

The repository has **no root `LICENSE` file**. Until it does, the default is
exclusive copyright: nobody else may legally use, copy or modify the kit, and
that includes anyone Design Angle is sold to. That needs deciding before the
kit is distributed, published to npm, or installed as a skill by anyone else.
